# Mechanism Browser
You do not know engineering terminology but want to 3D print machines? This project lets you browse and find mechanisms that you need by describing their functionality.


<br></br>
## Setup
### Add server to hosts file
For any system that should have access to the Mechanism Browser, add the IP of the server and the hostname "mechanism-browser" to its hosts file.

### Setup the Django server
Make sure that you are using Python 3.

Install the requirements:
```
sudo pip install -r Mechanism-Browser/backend/requirements.txt
```

Navigate to `Mechanism-Browser/backend/mechanismbackend/`.
Migrate the schemas:
```
python manage.py migrate

```
Create a superuser and choose a username and a password:
```
python manage.py createsuperuser
```

Finally, start the Django server:
```
python manage.py runserver 0.0.0.0:8000
```

### Setup the Node.js server
Navigate to `Mechanism-Browser/frontend/`.
Install the dependencies:
```
sudo npm install
```

Then, start the Node.js server:
```
sudo npm start
```


<br></br>
## Usage
### Create a mechanism
In your browser, open `http://mechainsm-browser:8000/admin`.
At "Mechanisms", click "Add", fill in the form, and confirm.

### List mechanisms
In your browser, open `http://mechanism-browser:8000/api/mechanisms`.

### Search mechanisms
In your browser, open `http://mechanism-browser/`.
