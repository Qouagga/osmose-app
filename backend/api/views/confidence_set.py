"""Annotation set DRF-Viewset file"""

from rest_framework import viewsets
from rest_framework.response import Response

from backend.api.models import ConfidenceIndicatorSet
from backend.api.serializers import ConfidenceIndicatorSetSerializer


class ConfidenceSetViewSet(viewsets.ViewSet):
    """
    A simple ViewSet for user-related actions
    """

    serializer_class = ConfidenceIndicatorSetSerializer

    def list(self, request):
        """List users"""
        queryset = ConfidenceIndicatorSet.objects.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
