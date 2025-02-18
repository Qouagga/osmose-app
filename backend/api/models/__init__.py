"""All Django models available"""

from django.contrib.auth import get_user_model

from backend.api.models.datasets import Collection, DatasetType, Dataset, DatasetFile
from backend.api.models.metadata import (
    AudioMetadatum,
    GeoMetadatum,
    SpectroConfig,
    TabularMetadatum,
    TabularMetadataVariable,
    TabularMetadataShape,
    WindowType,
)
from backend.api.models.annotations import (
    AnnotationTag,
    AnnotationSet,
    AnnotationCampaign,
    AnnotationComment,
    AnnotationResult,
    AnnotationSession,
    AnnotationTask,
)

User = get_user_model()
