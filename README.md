<<<<<<< HEAD
# Mechanism Browser
You do not know engineering terminology but want to 3D print machines? This project lets you browse and find mechanisms that you need by describing their functionality.


<br></br>
## Setup
### Add server to hostfile
For any system that should have access to the Mechanism Browser, add the IP of the server and the hostname "mechanism-browser" to its hostsfile.

### Run the Django server
=======
# MechanismBrowser
You do not know engineering terminology but want to 3D print machines? This project lets you browse and find mechanisms that you need by describing their functionality.

## Setup the Django server
>>>>>>> master
Install the requirements:
```
pip install -r backend/requirements.txt
```
Navigate to `backend/mechanismbackend/`.

Migrate the schemas:
```
python manage.py migrate
```
Create a superuser and choose a username and a password:
```
python manage.py createsuperuser
```
<<<<<<< HEAD
Finally, start the Django server:
```
python backend/mechanismbackend/manage.py runserver 0.0.0.0:8000
```

### Run the Node server
No setup is needed, just run:
```
npm start --prefix frontend
```


<br></br>
## Usage
### Create a mechanism
In your browser, open `http://mechainsm-browser:8000/admin`.
At "Mechanisms", click "Add", fill in the form, and confirm.

### List mechanisms
In your browser, open `http://mechanism-browser:8000/api/mechanisms`.

### Search mechanisms
In your browser, open `http://mechanism-browser:8080`.
=======

## Run the Django server
`python backend/mechanismbackend/manage.py runserver`

## Usage
### Create a mechanism
In your browser, open `http://127.0.0.1:8000/admin`.
At "Mechanisms", click "Add", fill in the form, and confirm.

### List mechanisms
In your browser, open `http://127.0.0.1:8000/api/mechanisms`.

### Search mechanisms
In your browser, open `frontend/index.html`.
>>>>>>> master
