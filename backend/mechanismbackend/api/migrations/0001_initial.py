# Generated by Django 2.0.4 on 2018-04-26 14:55

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Mechanism',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('link', models.URLField()),
                ('image', models.ImageField(upload_to='')),
                ('inputRotationX', models.BooleanField()),
                ('inputRotationY', models.BooleanField()),
                ('inputRotationZ', models.BooleanField()),
                ('inputTranslationX', models.BooleanField()),
                ('inputTranslationY', models.BooleanField()),
                ('inputTranslationZ', models.BooleanField()),
                ('outputRotationX', models.BooleanField()),
                ('outputRotationY', models.BooleanField()),
                ('outputRotationZ', models.BooleanField()),
                ('outputTranslationX', models.BooleanField()),
                ('outputTranslationY', models.BooleanField()),
                ('outputTranslationZ', models.BooleanField()),
                ('transmission', models.IntegerField()),
                ('comments', models.TextField()),
            ],
        ),
    ]