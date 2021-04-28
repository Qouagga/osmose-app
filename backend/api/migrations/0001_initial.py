# Generated by Django 3.2 on 2021-04-28 19:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnnotationCampaign',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
                ('instructions_url', models.TextField()),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField()),
            ],
            options={
                'db_table': 'annotation_campaigns',
            },
        ),
        migrations.CreateModel(
            name='AnnotationTag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'annotation_tags',
            },
        ),
        migrations.CreateModel(
            name='AudioMetadatum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField(null=True)),
                ('end', models.DateTimeField(null=True)),
                ('num_channels', models.IntegerField(null=True)),
                ('sample_rate_khz', models.FloatField(null=True)),
                ('total_samples', models.IntegerField(null=True)),
                ('sample_bits', models.IntegerField(null=True)),
                ('gain_db', models.FloatField(null=True)),
                ('gain_rel', models.FloatField(null=True)),
                ('dutycycle_rdm', models.FloatField(null=True)),
                ('dutycycle_rim', models.FloatField(null=True)),
            ],
            options={
                'db_table': 'audio_metadata',
            },
        ),
        migrations.CreateModel(
            name='Collection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'collections',
            },
        ),
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('dataset_path', models.CharField(max_length=255)),
                ('status', models.IntegerField()),
                ('files_type', models.CharField(max_length=255)),
                ('start_date', models.DateField(null=True)),
                ('end_date', models.DateField(null=True)),
                ('audio_metadatum', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.audiometadatum')),
            ],
            options={
                'db_table': 'datasets',
            },
        ),
        migrations.CreateModel(
            name='DatasetType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
            ],
            options={
                'db_table': 'dataset_types',
            },
        ),
        migrations.CreateModel(
            name='GeoMetadatum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
                ('location', models.TextField()),
                ('region', models.TextField()),
            ],
            options={
                'db_table': 'geo_metadata',
            },
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('to_execute', models.TextField()),
                ('locked_at', models.DateTimeField()),
                ('locked_by', models.CharField(max_length=255)),
                ('status', models.IntegerField()),
                ('result', models.TextField()),
                ('queue', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'jobs',
            },
        ),
        migrations.CreateModel(
            name='TabularMetadatum',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
                ('dimension_count', models.IntegerField()),
                ('variable_count', models.IntegerField()),
            ],
            options={
                'db_table': 'tabular_metadata',
            },
        ),
        migrations.CreateModel(
            name='TabularMetadataVariable',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
                ('data_type', models.CharField(max_length=255)),
                ('dimension_size', models.IntegerField()),
                ('variable_position', models.IntegerField()),
                ('tabular_metadata', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.tabularmetadatum')),
            ],
            options={
                'db_table': 'tabular_metadata_variables',
            },
        ),
        migrations.CreateModel(
            name='TabularMetadataShape',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dimension_position', models.IntegerField()),
                ('tabular_metadata_dimension', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dimension', to='api.tabularmetadatavariable')),
                ('tabular_metadata_variable', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variable', to='api.tabularmetadatavariable')),
            ],
            options={
                'db_table': 'tabular_metadata_shapes',
            },
        ),
        migrations.CreateModel(
            name='DatasetFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('filename', models.CharField(max_length=255)),
                ('filepath', models.CharField(max_length=255)),
                ('size', models.BigIntegerField()),
                ('audio_metadata', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.audiometadatum')),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dataset_files', to='api.dataset')),
                ('tabular_metadata', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.tabularmetadatum')),
            ],
            options={
                'db_table': 'dataset_files',
            },
        ),
        migrations.AddField(
            model_name='dataset',
            name='dataset_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.datasettype'),
        ),
        migrations.AddField(
            model_name='dataset',
            name='geo_metadatum',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.geometadatum'),
        ),
        migrations.AddField(
            model_name='dataset',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='dataset',
            name='tabular_metadatum',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='api.tabularmetadatum'),
        ),
        migrations.CreateModel(
            name='CollectionDataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('collection', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.collection')),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.dataset')),
            ],
            options={
                'db_table': 'collection_datasets',
            },
        ),
        migrations.CreateModel(
            name='AnnotationTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.IntegerField()),
                ('annotation_campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.annotationcampaign')),
                ('annotator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('dataset_file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.datasetfile')),
            ],
            options={
                'db_table': 'annotation_tasks',
            },
        ),
        migrations.CreateModel(
            name='AnnotationSet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('desc', models.TextField()),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('tags', models.ManyToManyField(to='api.AnnotationTag')),
            ],
            options={
                'db_table': 'annotation_sets',
            },
        ),
        migrations.CreateModel(
            name='AnnotationSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField()),
                ('session_output', models.JSONField()),
                ('annotation_task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.annotationtask')),
            ],
            options={
                'db_table': 'annotation_sessions',
            },
        ),
        migrations.CreateModel(
            name='AnnotationResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('startTime', models.FloatField()),
                ('endTime', models.FloatField()),
                ('startFrequency', models.FloatField()),
                ('endFrequency', models.FloatField()),
                ('annotation_tag', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.annotationtag')),
                ('annotation_task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.annotationtask')),
            ],
            options={
                'db_table': 'annotation_results',
            },
        ),
        migrations.CreateModel(
            name='AnnotationCampaignDataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('annotation_campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.annotationcampaign')),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.dataset')),
            ],
            options={
                'db_table': 'annotation_campaign_datasets',
            },
        ),
        migrations.AddField(
            model_name='annotationcampaign',
            name='annotation_set',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.annotationset'),
        ),
        migrations.AddField(
            model_name='annotationcampaign',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
