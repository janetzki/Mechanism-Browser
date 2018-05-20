from django.db import models

# Create your models here.


class Mechanism(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200)
    link = models.URLField()
    image = models.ImageField(upload_to='img/')
    inputR1 = models.BooleanField()
    inputR2 = models.BooleanField()
    inputR3 = models.BooleanField()
    inputT1 = models.BooleanField()
    inputT2 = models.BooleanField()
    inputT3 = models.BooleanField()
    outputR1 = models.BooleanField()
    outputR2 = models.BooleanField()
    outputR3 = models.BooleanField()
    outputT1 = models.BooleanField()
    outputT2 = models.BooleanField()
    outputT3 = models.BooleanField()
    transmission = models.IntegerField()  # TODO: what does this represent and is this the right type?
    comments = models.TextField(blank=True)  # TODO: might be better to use charfield, have to think about this
    # TODO: what to do with the metadate field in the JSON template?

    class Meta:
        ordering = ('created',)

    def __str__(self):
        return self.name
