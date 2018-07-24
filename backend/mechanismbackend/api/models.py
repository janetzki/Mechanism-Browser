from django.db import models
from rest_framework.exceptions import ValidationError
from updown.fields import AnonymousRatingField


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
    rating = AnonymousRatingField()
    complete = models.BooleanField(default=False)
    parametric_model = models.FileField(upload_to='parametric_models', blank=True, null=True)

    class Meta:
        ordering = ('-rating_likes', 'rating_dislikes')  # sort descending by likes, then ascending by dislikes

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

    def get_dissimilarity(self, other):
        axes_dissimilarity = self._get_axes_dissimilarity(other)
        transmission_dissimilarity = self._get_transmission_dissimilarity(other)
        return 0.8 * axes_dissimilarity + 0.2 * transmission_dissimilarity

    def _get_axes_dissimilarity(self, other):
        shared_axes = 0
        if self.inputR1 == other.inputR1:
            shared_axes += 1
        if self.inputR2 == other.inputR2:
            shared_axes += 1
        if self.inputR3 == other.inputR3:
            shared_axes += 1
        if self.inputT1 == other.inputT1:
            shared_axes += 1
        if self.inputT2 == other.inputT2:
            shared_axes += 1
        if self.inputT3 == other.inputT3:
            shared_axes += 1
        if self.outputR1 == other.outputR1:
            shared_axes += 1
        if self.outputR2 == other.outputR2:
            shared_axes += 1
        if self.outputR3 == other.outputR3:
            shared_axes += 1
        if self.outputT1 == other.outputT1:
            shared_axes += 1
        if self.outputT2 == other.outputT2:
            shared_axes += 1
        if self.outputT3 == other.outputT3:
            shared_axes += 1
        return 1 - (shared_axes / 12)

    def _get_transmission_dissimilarity(self, other):
        return 0 if self.transmission == other.transmission else 1
