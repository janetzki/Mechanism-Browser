from django.db import models

# Create your models here.


class Mechanism(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200)
    link = models.URLField()
    image = models.ImageField()
    inputRotationX = models.BooleanField()
    inputRotationY = models.BooleanField()
    inputRotationZ = models.BooleanField()
    inputTranslationX = models.BooleanField()
    inputTranslationY = models.BooleanField()
    inputTranslationZ = models.BooleanField()
    outputRotationX = models.BooleanField()
    outputRotationY = models.BooleanField()
    outputRotationZ = models.BooleanField()
    outputTranslationX = models.BooleanField()
    outputTranslationY = models.BooleanField()
    outputTranslationZ = models.BooleanField()
    transmission = models.IntegerField()  # TODO: what does this represent and is this the right type?
    comments = models.TextField(blank=True)  # TODO: might be better to use charfield, have to think about this
    # TODO: what to do with the metadate field in the JSON template?


    class Meta:
        ordering = ('created',)

