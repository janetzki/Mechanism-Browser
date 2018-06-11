from django.db import models
from rest_framework.exceptions import ValidationError

# Create your models here.


class Mechanism(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200, default='Mechanism Request')
    link = models.URLField(blank=True)
    image = models.ImageField(upload_to='img/', default='img/mechanism-placeholder.png')
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
    transmission = models.IntegerField(blank=True, null=True)
    comments = models.TextField(blank=True)

    class Meta:
        ordering = ('created',)

    def __str__(self):
        return self.name

    def clean(self):
        if (not self.inputR1 and
                not self.inputR2 and
                not self.inputR3 and
                not self.inputT1 and
                not self.inputT2 and
                not self.inputT3 and
                not self.outputR1 and
                not self.outputR2 and
                not self.outputR3 and
                not self.outputT1 and
                not self.outputT2 and
                not self.outputT3):
            raise ValidationError("Mechanism needs at least one input or output to be specified.")

