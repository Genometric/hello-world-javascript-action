This action automates testing workflows written in Workflow Description Language (WDL)
on a self-hosted Cromwell server on Azure. 


## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

```yaml
uses: actions/hello-world-javascript-action@e76147da8e5c81eaf017dede5645551d4b94427b
with:
  who-to-greet: 'Mona the Octocat'
```




release:

1. compile:
```shell
ncc build index.js --license licenses.txt
```

2. git commit push:

3. git tag:

```shell
git tag -a -m "update" v1.12
```

4. push tag:

```shell
git push --follow-tags 
```