import hvac
import boto3 
from botocore.exceptions import ClientError



class Vault: 


    @staticmethod   
    def get_secret():
        
        secret_name = "vault-token"
        region_name = "us-west-1"
        
        # Create a Secrets Manager client
        session = boto3.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        try:
            get_secret_value_response = client.get_secret_value(
                SecretId= secret_name
            )
        except ClientError as e:
            raise e

        # Decrypts secret using the associated KMS key.
        secret_key = get_secret_value_response['SecretString']
        return secret_key

# Set up the connection parameters
# Create a client to connect to Vault
client = hvac.Client(url='http://ec2-54-215-183-0.us-west-1.compute.amazonaws.com:8200')

# Authenticate to Vault using a token or other authentication method

client.token = Vault.get_secret()

# Read the secret values from the KV-v1 secret engine
secret_path = '/myapp'
secret = client.secrets.kv.v1.read_secret(secret_path)

# Extract the values from the secret dictionary
host = secret['data']['dbhost']
user = secret['data']['username']
password = secret['data']['password']
dbname = "tablereservation"
port = "5432"
conn = ''