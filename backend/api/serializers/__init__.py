"""
DRF serializers module to be used in viewsets
"""

from backend.api.serializers.dataset import DatasetSerializer, SpectroConfigSerializer
from backend.api.serializers.user import UserSerializer, UserCreateSerializer
from backend.api.serializers.annotation_set import AnnotationSetSerializer
from backend.api.serializers.confidence_set import ConfidenceIndicatorSetSerializer
from backend.api.serializers.annotation_campaign import (
    AnnotationCampaignListSerializer,
    AnnotationCampaignRetrieveAuxCampaignSerializer,
    AnnotationCampaignRetrieveAuxTaskSerializer,
    AnnotationCampaignRetrieveSerializer,
    AnnotationCampaignCreateSerializer,
    AnnotationCampaignAddAnnotatorsSerializer,
)
from backend.api.serializers.annotation_task import (
    AnnotationTaskSerializer,
    AnnotationTaskBoundarySerializer,
    AnnotationTaskResultSerializer,
    AnnotationTaskSpectroSerializer,
    AnnotationTaskRetrieveSerializer,
    AnnotationTaskUpdateSerializer,
    AnnotationTaskUpdateOutputCampaignSerializer,
)
