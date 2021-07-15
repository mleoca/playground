### Edit secret .yaml from templates if needed
### Use helm to install the chart:
```shell
    helm install postgres helm/postgres/
    helm install todo helm/todo/
```

### local testing
```shell
    kubectl port-forward service/todo 5000:80
    # then access http://127.0.0.1:5000/ from browser
```

### deploying with pulumi
```shell
    # export these variables first: GOOGLE_REGION, GOOGLE_ZONE and GOOGLE_PROJECT
    # cluster will beed to be created before installing the helm charts
    htpasswd -c auth.txt todo
    pulumi up
```

### cleanup:
```shell
    helm delete todo
    helm delete postgres && kubectl delete pvc postgres-master-postgres-master-0 postgres-rep-postgres-rep-0
    pulumi destroy
```
