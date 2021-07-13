### Edit secret .yaml from templates if needed
### Use helm to install the chart:
```shell
    helm install postgres .
```

### for cleanup:
```shell
    helm delete postgres && kubectl delete pvc postgres-master-postgres-master-0 postgres-rep-postgres-rep-0
```