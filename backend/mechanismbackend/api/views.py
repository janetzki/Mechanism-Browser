from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view



hardcoded_json = """{
"wormdrive": { 
"link": "https://grabcad.com/library/customisable-worm-transmission-1", 
"image": "/img/0001-wormdrive.jpg", 
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
"transmission": 100, 
"comments": [], 
"metadata": []
},

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
},

"beltdrive-quarterturn": {
"link": "https://www.youtube.com/watch?v=RpVSn_ZZCOI",
"image": "/img/0003-beltdrive-quarterturn.jpg",
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
"transmission": 1,
"comments": [],
"metadata": []
}
}"""


@api_view(['GET'])
def api_root(request, format=None):
    return HttpResponse(hardcoded_json, content_type='application/json')
