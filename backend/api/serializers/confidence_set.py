"""Annotation set DRF serializers file"""

# Serializers have too many false-positives on the following warnings:
# pylint: disable=missing-function-docstring, abstract-method

from rest_framework import serializers

from drf_spectacular.utils import extend_schema_field

from backend.api.models import ConfidenceIndicatorSet, Confidence

class ConfidenceSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data """

    name = serializers.SerializerMethodField()

    class Meta:
        model = Confidence
        fields = ["id",
                  "name",
                  "order",
                  ]

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_name(self, confidence):
        return confidence.name.name

class ConfidenceResultSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data """

    name = serializers.SerializerMethodField()

    class Meta:
        model = Confidence
        fields = [
                  "name",
                  "order",
                  ]

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_name(self, confidence):
        return confidence.name.name

class ConfidenceIndicatorSetSerializer(serializers.ModelSerializer):
    """Serializer meant to output basic ConfidenceIndicatorSet data """

    confidences = ConfidenceSerializer(many=True)
    default_confidence = ConfidenceSerializer()

    class Meta:
        model = ConfidenceIndicatorSet
        fields = ["id",
                  "name",
                  "desc",
                  "confidences",
                  "default_confidence"
                  ]


