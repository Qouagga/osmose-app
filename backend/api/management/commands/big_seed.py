import os, glob

from datetime import datetime
from random import randint, choice

# from faker import Faker

from django.core import management, files
from django.utils.dateparse import parse_datetime
from datetime import timedelta
from django.utils import timezone

from django.contrib.auth.models import User
from backend.api.models import (
    DatasetType,
    GeoMetadatum,
    AudioMetadatum,
    Dataset,
    AnnotationSet,
    AnnotationCampaign,
)


class Command(management.BaseCommand):
    help = "Seeds the DB with fake lot of data (deletes all existing data first)"

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
        management.call_command("flush", verbosity=0, interactive=False)

        # Creation
        self.datafile_count = 50
        self._create_users()
        self._create_datasets("SPM Aural A 2010", 0)

        for i in range(1,50):
            self._create_datasets("SPM", i)

        self._create_annotation_sets()
        self._create_annotation_campaigns()
        self._create_spectro_configs()
        self._create_annotation_results()

    def _create_users(self):
        print("_create_users")
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

    def _create_datasets(self, dataset_name, num):
        print(f"_create_datasets : {dataset_name} {num}")
        dataset_type = DatasetType.objects.create(name=f"Coastal audio recordings {num}")
        audio_metadatum = AudioMetadatum.objects.create(
            num_channels=1,
            sample_rate_khz=32768,
            total_samples=88473600,
            sample_bits=16,
            gain_db=22,
            gain_rel=-165,
            dutycycle_rdm=45,
            dutycycle_rim=60,
        )
        geo_metadatum = GeoMetadatum.objects.create(
            name=f"Saint-Pierre-et-Miquelon {num}", desc="South of Saint-Pierre-et-Miquelon"
        )
        self.dataset = Dataset.objects.create(
            name=f"{dataset_name} {num}",
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
        print("_create_annotation_sets")
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
        for i in range(0,10):
            another_set = {
                    "name": f"Test SPM campaign {i}",
                    "desc": "Annotation set made for Test SPM campaign",
                    "tags": ["Mysticetes", "Odoncetes", "Boat", "Rain", "Other"],
                    }
            sets.append(another_set)
        self.annotation_sets = {}
        for seed_set in sets:
            annotation_set = AnnotationSet.objects.create(
                name=seed_set["name"], desc=seed_set["desc"], owner=self.admin
            )
            if seed_set["name"] == "Test SPM campaign" :
                for tag in seed_set["tags"]:
                    annotation_set.tags.create(name=tag)
                self.annotation_sets[seed_set["name"]] = annotation_set
            elif seed_set["name"] == "Test DCLDE LF campaign":
                for tag in seed_set["tags"]:
                    annotation_set.tags.create(name=tag)
                annotation_set_MystiOdoBoat = annotation_set
                self.annotation_sets[seed_set["name"]] = annotation_set
            else :
                self.annotation_sets[seed_set["name"]] = annotation_set_MystiOdoBoat

    def _create_annotation_campaigns(self):
        print("_create_annotation_campaigns")
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
        for i in range(0,10):
            another_campaigns = {
                    "name": f"Test SPM campaign {i}",
                    "desc": "Test annotation campaign",
                    "start": "2010-08-19",
                    "end": "2010-11-02",
                    "instructions_url": "https://en.wikipedia.org/wiki/Saint_Pierre_and_Miquelon",
                    "annotation_scope": 1,
                    "annotation_set": self.annotation_sets[f"Test SPM campaign {i}"],
                }
            campaigns.append(another_campaigns)
        self.campaigns = []
        for campaign_data in campaigns:
            campaign = AnnotationCampaign.objects.create(
                **campaign_data, owner=self.admin
            )
            campaign.datasets.add(self.dataset)
            for file in self.dataset.files.all():
                for user in self.users:
                    campaign.tasks.create(dataset_file=file, annotator=user, status=0)
            self.campaigns.append(campaign)

    def _create_spectro_configs(self):
        spectro_config1 = self.dataset.spectro_configs.create(
            name="spectro_config1",
            nfft=4096,
            window_size=2000,
            overlap=90,
            zoom_level=8,
        )
        spectro_config2 = self.dataset.spectro_configs.create(
            name="spectro_config2",
            nfft=2048,
            window_size=1000,
            overlap=90,
            zoom_level=8,
        )
        self.campaigns[0].spectro_configs.add(spectro_config2)
        for campaign in self.campaigns:
            campaign.spectro_configs.add(spectro_config1)
            campaign.save()

    def _create_annotation_results(self):
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
                    )
                task.status = 2
                task.save()
