FROM centos:centos7

ENV CODE_BASE_DIR="/code"
ENV APP_NAME="OOP_reserve_table_service"
ENV SERVICE_NAME="reservetableapi"

RUN yum update -y && \
    yum install -y git && \
    yum groupinstall -y 'Development Tools' &&\
    yum install -y centos-release-scl && \
    yum install -y gcc openssl-devel bzip2-devel libffi-devel zlib-devel &&\
    yum install -y epel-release && \
    yum install -y llvm5.0-devel &&\
    yum install -y postgresql-devel && \
    yum install -y python3-devel && \
    yum install -y gcc && \
    yum install -y jq && \
    yum install -y python3-pip
    
RUN mkdir -p "${CODE_BASE_DIR}"/"${APP_NAME}"
ADD reservetableapi "${CODE_BASE_DIR}"/"${APP_NAME}"/reservetableapi/
RUN pwd

RUN cd "${CODE_BASE_DIR}"/"${APP_NAME}"/ 
RUN python3 -m venv venv
RUN source venv/bin/activate

COPY  reservetableapi/requirements.txt "${CODE_BASE_DIR}"/"${APP_NAME}"/"${SERVICE_NAME}"/
COPY  reservetableapi/routes.py "${CODE_BASE_DIR}"/"${APP_NAME}"/"${SERVICE_NAME}"/
COPY  reservetableapi/main.py "${CODE_BASE_DIR}"/"${APP_NAME}"/"${SERVICE_NAME}"/
COPY  reservetableapi/entrypoint.sh "${CODE_BASE_DIR}"/"${APP_NAME}"/"${SERVICE_NAME}"/
COPY  reservetableapi/dbhelper.py "${CODE_BASE_DIR}"/"${APP_NAME}"/"${SERVICE_NAME}"/


RUN cd "${CODE_BASE_DIR}"/"${APP_NAME}"/"${SERVICE_NAME}"/ && \
    pip3 install -r requirements.txt


ENTRYPOINT ["/bin/bash","/code/OOP_reserve_table_service/reservetableapi/entrypoint.sh"]


