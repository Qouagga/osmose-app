import os, glob
from datetime import datetime
from random import randint, choice

# from faker import Faker

from django.core import management, files
from django.utils.dateparse import parse_datetime
from datetime import timedelta

from django.contrib.auth.models import User
from backend.api.models import (
    DatasetType,
    GeoMetadatum,
    AudioMetadatum,
    Dataset,
    AnnotationSet,
    AnnotationCampaign,
    WindowType,
    ConfidenceIndicator,
    ConfidenceIndicatorSet,
)

class Command(management.BaseCommand):
    help = "Seeds the DB with fake data (deletes all existing data first)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--init-only",
            action="store_true",
            default=False,
            help="Only run the first time",
        )

    def handle(self, *args, **options):
        # If init_only we run only if there is no seeded data yet
        if options["init_only"] and User.objects.count() > 0:
            return

        # Cleanup
        #management.call_command("flush", verbosity=0, interactive=False)

        # Creation
        self.datafile_count = 50
        self._create_users()
        self._create_datasets()
        self._create_annotation_sets()
        confidence_indicator_set, no_confidence, confidence = self._create_confidence_sets()
        self._create_annotation_campaigns(confidence_indicator_set)
        self._create_spectro_configs()
        self._create_annotation_results(no_confidence, confidence)

    def _create_users(self):
        users = ["dc", "ek", "ja", "pnhd", "ad", "rv"]
        password = "osmose29"
        self.admin = User.objects.create_user(
            "admin", "admin@osmose.xyz", password, is_superuser=True, is_staff=True
        )
        self.users = [self.admin]
        for user in users:
            self.users.append(
                User.objects.create_user(user, f"{user}@osmose.xyz", password)
            )

    def _create_datasets(self):
        dataset_type = DatasetType.objects.create(name="Coastal audio recordings")
        audio_metadatum = AudioMetadatum.objects.create(
            channel_count=1,
            dataset_sr=32768,
            total_samples=88473600,
            sample_bits=16,
            gain_db=22,
            gain_rel=-165,
            dutycycle_rdm=45,
            dutycycle_rim=60,
        )
        geo_metadatum = GeoMetadatum.objects.create(
            name="Saint-Pierre-et-Miquelon", desc="South of Saint-Pierre-et-Miquelon"
        )
        self.dataset = Dataset.objects.create(
            name="SPM Aural A 2010",
            start_date="2010-08-19",
            end_date="2010-11-02",
            files_type=".wav",
            status=1,
            dataset_type=dataset_type,
            audio_metadatum=audio_metadatum,
            geo_metadatum=geo_metadatum,
            owner=self.admin,
            dataset_path="seed/dataset_path",
        )
        for k in range(self.datafile_count):
            start = parse_datetime("2012-10-03T12:00:00+0200")
            end = start + timedelta(minutes=15)
            audio_metadatum = AudioMetadatum.objects.create(
                start=(start + timedelta(hours=k)), end=(end + timedelta(hours=k))
            )
            self.dataset.files.create(
                filename=f"sound{k:03d}.wav",
                filepath="audio/50h_0.wav",
                size=58982478,
                audio_metadatum=audio_metadatum,
            )

    def _create_annotation_sets(self):
        sets = [
            {
                "name": "Test SPM campaign",
                "desc": "Annotation set made for Test SPM campaign",
                "tags": ["Mysticetes", "Odoncetes", "Boat", "Rain", "Other"],
            },
            {
                "name": "Test DCLDE LF campaign",
                "desc": "Test annotation campaign DCLDE LF 2015",
                "tags": ["Dcall", "40-Hz"],
            },
        ]
        self.annotation_sets = {}
        for seed_set in sets:
            annotation_set = AnnotationSet.objects.create(
                name=seed_set["name"], desc=seed_set["desc"], owner=self.admin
            )
            for tag in seed_set["tags"]:
                annotation_set.tags.create(name=tag)
            self.annotation_sets[seed_set["name"]] = annotation_set

    def _create_confidence_sets(self):

        confidenceIndicatorSet = ConfidenceIndicatorSet.objects.create(
            name="Confident/NotConfident",
            )

        confidence_0 = ConfidenceIndicator.objects.create(label="not confident",
                                                          level=0,
                                                          confidence_indicator_set=confidenceIndicatorSet)
        confidence_1 = ConfidenceIndicator.objects.create(label="confident",
                                                          level=1,
                                                          confidence_indicator_set=confidenceIndicatorSet,
                                                          default_confidence_indicator_set=confidenceIndicatorSet)

        return confidenceIndicatorSet, confidence_0, confidence_1

    def _create_annotation_campaigns(self, confidenceIndicatorSet):
        campaigns = [
            {
                "name": "Test SPM campaign",
                "desc": "Test annotation campaign",
                "start": "2010-08-19",
                "end": "2010-11-02",
                "instructions_url": "https://en.wikipedia.org/wiki/Saint_Pierre_and_Miquelon",
                "annotation_scope": 1,
                "annotation_set": self.annotation_sets["Test SPM campaign"],
            },
            {
                "name": "Test DCLDE LF campaign",
                "desc": "Test annotation campaign DCLDE LF 2015",
                "start": "2012-06-22",
                "end": "2012-06-26",
                "annotation_set": self.annotation_sets["Test DCLDE LF campaign"],
                "annotation_scope": 2,
            },
        ]
        self.campaigns = []
        for campaign_data in campaigns:
            campaign = AnnotationCampaign.objects.create(
                **campaign_data, owner=self.admin, confidence_indicator_set=confidenceIndicatorSet,
            )
            campaign.datasets.add(self.dataset)
            for file in self.dataset.files.all():
                for user in self.users:
                    campaign.tasks.create(dataset_file=file, annotator=user, status=0)
            self.campaigns.append(campaign)

    def _create_spectro_configs(self):
        window_type = WindowType.objects.create(name="Hamming")
        spectro_config1 = self.dataset.spectro_configs.create(
            name="4096_4096_90",
            nfft=4096,
            window_size=4096,
            overlap=90,
            zoom_level=8,
            spectro_normalization="density",
            data_normalization="0",
            zscore_duration="0",
            hp_filter_min_freq=0,
            colormap="Blues",
            dynamic_min=0,
            dynamic_max=0,
            window_type=window_type,
            frequency_resolution=0,
        )
        spectro_config2 = self.dataset.spectro_configs.create(
            name="2048_1000_90",
            nfft=2048,
            window_size=1000,
            overlap=90,
            zoom_level=8,
            spectro_normalization="density",
            data_normalization="0",
            zscore_duration="0",
            hp_filter_min_freq=0,
            colormap="Greens",
            dynamic_min=0,
            dynamic_max=0,
            window_type=window_type,
            frequency_resolution=0,
        )
        self.campaigns[0].spectro_configs.add(spectro_config2)
        for campaign in self.campaigns:
            campaign.spectro_configs.add(spectro_config1)
            campaign.save()

    def _create_annotation_results(self, no_confidence, confidence):
        campaign = self.campaigns[0]
        tags = list(self.annotation_sets.values())[0].tags.values_list("id", flat=True)
        for user in self.users:
            done_files = randint(5, self.datafile_count - 5)
            tasks = campaign.tasks.filter(annotator_id=user.id)[:done_files]
            for task in tasks:
                for _ in range(randint(1, 5)):
                    start_time = randint(0, 600)
                    start_frequency = randint(0, 10000)
                    task.results.create(
                        start_time=start_time,
                        end_time=start_time + randint(30, 300),
                        start_frequency=start_frequency,
                        end_frequency=start_frequency + randint(2000, 5000),
                        annotation_tag_id=choice(tags),
                        confidence_indicator=choice([no_confidence, confidence]),
                    )
                task.status = 2
                task.save()
