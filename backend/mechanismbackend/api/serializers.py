from rest_framework import serializers
from .models import Mechanism


class MechanismSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanism
        fields = ('id',
                 'name',
                 'link',
                 'image',
                 'inputRotationX',
                 'inputRotationY',
                 'inputTranslationX',
                 'inputTranslationY',
                 'inputTranslationZ',
                 'outputRotationX',
                 'outputRotationY',
                 'outputRotationZ',
                 'outputTranslationX',
                 'outputTranslationY',
                 'outputTranslationZ',
                 'transmission',
                 'comments',
                 'created')

    def to_representation(self, instance):
        input_dict = dict()
        input_dict['r1'] = instance.inputRotationX
        input_dict['r2'] = instance.inputRotationY
        input_dict['r3'] = instance.inputRotationZ
        input_dict['t1'] = instance.inputTranslationX
        input_dict['t2'] = instance.inputTranslationY
        input_dict['t3'] = instance.inputTranslationZ

        output_dict = dict()
        output_dict['r1'] = instance.outputRotationX
        output_dict['r2'] = instance.outputRotationY
        output_dict['r3'] = instance.outputRotationZ
        output_dict['t1'] = instance.outputTranslationX
        output_dict['t2'] = instance.outputTranslationY
        output_dict['t3'] = instance.outputTranslationZ

        details = dict()
        details['id'] = instance.id
        details['name'] = instance.name
        details['link'] = instance.link
        details['image'] = instance.image.url
        details['input'] = input_dict
        details['output'] = output_dict
        details['transmission'] = instance.transmission
        details['comments'] = instance.comments
        details['created'] = instance.created

        return details
