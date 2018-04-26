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

"""TODO: create proper JSON reprensentation as soon as JSON model is decided on
    def to_representation(self, instance):
        input = list()
        input

        details = dict()
        details['link'] = instance.link
        details['image'] = instance.image
        details['input'] =


        representation = {
            instance.name: instance.name,

        }
"""


"""
        "bevelgears": {
    "link": "https://grabcad.com/library/parametric-bevel-gear-set-for-nx-1",
    "image": "/img/0002-bevelgears.jpg",
    "input": [
            {   "r1": 1 },
            {   "r2": 0 },
            {   "r3": 0 },
            {   "t1": 0 },
            {   "t2": 0 },
            {   "t3": 0 }
            ],
    "output": [
            {   "r1": 0 },
            {   "r2": 1 },
            {   "r3": 0 },
            {   "t1": 0 },
            {   "t2": 0 },
            {   "t3": 0 }
            ],
    "transmission": 10,
    "comments": [],
    "metadata": []
}
        
        
        """