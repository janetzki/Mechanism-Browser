from rest_framework import serializers
from .models import Mechanism


class MechanismSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mechanism
        fields = '__all__'

    def to_representation(self, instance):
        input_dict = dict()
        input_dict['r1'] = instance.inputR1
        input_dict['r2'] = instance.inputR2
        input_dict['r3'] = instance.inputR3
        input_dict['t1'] = instance.inputT1
        input_dict['t2'] = instance.inputT2
        input_dict['t3'] = instance.inputT3

        output_dict = dict()
        output_dict['r1'] = instance.outputR1
        output_dict['r2'] = instance.outputR2
        output_dict['r3'] = instance.outputR3
        output_dict['t1'] = instance.outputT1
        output_dict['t2'] = instance.outputT2
        output_dict['t3'] = instance.outputT3

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
        details['rating_likes'] = instance.rating_likes
        details['rating_dislikes'] = instance.rating_dislikes


        return details
