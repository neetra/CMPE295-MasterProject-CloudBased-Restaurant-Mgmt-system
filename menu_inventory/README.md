# menuinventory
Menu management service enables to perform CRUD ops on menu

Advisor : Andrew Bond

# Design Diagrams
- ER Diagram
	![hh](DesignDiagrams/MenuItemInventory_ERDiagra.png)


# SQL Scripts
- Execute sql script ([here](service/SQLScripts))on db before running application. 


# Steps to run
- Edit [config.py](service/config.py)
- Create python virtual enviornment (For linux or mac replace activate.ps1)
	```
	    - cd service 
		- python -m venv .venv
		- .\.venv\Scripts\Activate.ps1 
		- pip install -r requirements.txt
		- python .\MenuInventory.py.py
	```

# Postman Collection
- Link is [here](https://go.postman.co/workspace/MastersProject~e9870151-0067-45f0-8d90-adcca7b57d0c/collection/2280968-88a4bd86-64cb-47b8-bdb8-3aa6fde77dfb?action=share&creator=2280968)

- TODO: add postman json files
