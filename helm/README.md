### Edit secret .yaml from templates if needed
### Use helm to install the chart:
```shell
    helm install postgres postgres/
    helm install todo todo/
```

### for cleanup:
```shell
    helm delete todo
    helm delete postgres && kubectl delete pvc postgres-master-postgres-master-0 postgres-rep-postgres-rep-0
```