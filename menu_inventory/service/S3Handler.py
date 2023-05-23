import boto3
from config import aws_bucket_name, aws_access_key_id, aws_secret_access_key, aws_s3_url
import tempfile
import os;
import shortuuid;
from werkzeug.utils import secure_filename
from configparser import Error

class S3Handler:
    def __init__(self):    
        self.url = aws_s3_url
        self.s3Client = boto3.client('s3',
                            aws_access_key_id= aws_access_key_id, 
                            aws_secret_access_key= aws_secret_access_key
                            )
        self.BUCKET_NAME=aws_bucket_name                      
       
    def upload_file(self, file) :
        try:
            filename = secure_filename(shortuuid.uuid() + "_"+file.filename )
            filePath = os.path.join(tempfile.gettempdir(), filename)
            file.save(filePath)

            res  = self.s3Client.upload_file(
                        Bucket = self.BUCKET_NAME,
                        Filename=filePath,
                        Key = filename,
                        ExtraArgs={'ACL':'public-read'}
                    ) 
            return self.url + filename;     
        except Error as e:
            print(e)
            return e

     