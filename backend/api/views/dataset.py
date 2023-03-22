"""Dataset DRF-Viewset file"""
import csv
import re
import json

from django.db.models import Count
from django.http import HttpResponse, HttpResponseBadRequest
from django.conf import settings

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action

from sentry_sdk import capture_exception
from backend.api.models import Dataset
from backend.api.actions import datawork_import
from backend.api.actions.check_new_spectro_config_validity import check_new_spectro_config_validity
from backend.api.serializers import DatasetSerializer


class DatasetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for dataset-related actions
    """

    serializer_class = DatasetSerializer

    def list(self, request):
        """List available datasets"""
        queryset = Dataset.objects.annotate(Count("files")).select_related(
            "dataset_type"
        )

        serializer = self.serializer_class(queryset, many=True)

        return Response(serializer.data)

    @action(detail=False)
    def list_to_import(self, request):
        """list dataset in datasets.csv"""
        dataset_names = Dataset.objects.values_list("name", flat=True)
        new_datasets = []

        # Check for new datasets
        try:
            with open(
                settings.DATASET_IMPORT_FOLDER / "datasets.csv", encoding="utf-8"
            ) as csvfile:
                for dataset in csv.DictReader(csvfile):
                    if dataset["name"] not in dataset_names:
                        new_datasets.append(dataset)
        except FileNotFoundError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)

        if not new_datasets:
            return HttpResponseBadRequest(
                "No new data : Add new data in datasets.csv", status=400
            )

        return Response(new_datasets)

    @action(detail=False, methods=["POST"])
    def datawork_import(self, request):
        """Import new datasets from datawork"""
        if not request.user.is_staff:
            return HttpResponse("Unauthorized", status=403)

        try:
            new_datasets = datawork_import(
                wanted_datasets=request.data["wanted_datasets"],
                importer=request.user,
            )
        except FileNotFoundError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)
        except PermissionError as error:
            capture_exception(error)
            return HttpResponse(error, status=400)
        except KeyError as error:
            capture_exception(error)
            return HttpResponse(
                f"One of the import CSV is missing the following column : {error}",
                status=400,
            )

        queryset = new_datasets.annotate(Count("files")).select_related("dataset_type")
        serializer = self.serializer_class(queryset, many=True)

        try:
            check_new_spectro_config_validity()
        except FileNotFoundError as error:
            regex = "dataset/(.*)/analysis"
            buggy_dataset = re.findall(regex, str(error))
            check_error = {"error_lines": [
                "Successful import. Reload (F5) this page to see it.",
                f"But an another dataset config spectro ({buggy_dataset[0]}) can't be update :",
                f"{error}",
                ]}
            capture_exception(check_error)
            return HttpResponse(json.dumps(check_error), status=400)

        return Response(serializer.data)
