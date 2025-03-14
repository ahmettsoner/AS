## Dev Channel tests

<!-- aritmetik değerler kullanarak semver sıralama -->

```bash
git checkout --orphan new-main
git add .
git commit -m "Initial commit"
git branch -D main
git branch -m main
git branch | grep -v "main" | xargs git branch -D
git tag -d $(git tag)
git reflog expire --all --expire=now
git gc --prune=now
git gc --aggressive --prune=now

```

1. Iteration 1
```shell
git checkout -b dev
git checkout -b feature/add-new-api
git checkout dev
git merge feature/add-new-api --no-ff
git branch -d feature/add-new-api
```

```
git tag -a $(./versioning-dev2.sh) -m "Development release $(./versioning-dev2.sh)"
```

2. Iteration 2

2.a v1.0.0 Test faza geçiş

```shell
git checkout -b release/$(./versioning-dev2.sh --print=base)-alpha dev
git tag -a v$(./versioning-dev2.sh --print=base)-alpha.1 -m "Alpha release v$(./versioning-dev2.sh --print=base)-alpha.1"
git checkout dev
```

* Fix çıkarsa:
```shell
git checkout release/1.0.0-alpha
git add .
git commit -m "Fix issue in alpha release"
git checkout dev
git merge release/1.0.0-alpha --no-ff
```

2.b v1.1.0 Dev faz hazırlanması


* Eğer Alpha branch yoksa default base version kullan
```bash
git checkout -b dev
git checkout -b feature/add-new-api-endpoint
git checkout dev
git merge feature/add-new-api-endpoint --no-ff
git branch -d feature/add-new-api-endpoint
```


```bash
git tag -a $(./versioning-dev2.sh) -m "Development release $(./versioning-dev2.sh)"
```









<!-- ********************************************************************************************** -->
<!-- ********************************************************************************************** -->
<!-- ********************************************************************************************** -->
<!-- ********************************************************************************************** -->
```bash
> ./versioning-dev.sh --debug
v1.0.0-dev.2
Base Option: 
Base Version for dev: 1.0.0
Incremented dev Version: v1.0.0-dev.2
```

```bash
git tag -a $(./versioning-dev.sh) -m "Development release $(./versioning-dev.sh)"
```

```bash
> ./versioning-dev.sh --debug                                                      
v1.0.0-dev.3
Base Option: 
Base Version for dev: 1.0.0
Incremented dev Version: v1.0.0-dev.3
```

Alpha branch'e taşı

<!-- 
### With alpha version, no dev version
```bash
git tag -a v1.0.0-alpha.1 -m "Alpha release v1.0.0-alpha.1"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: v1.0.0-alpha.1
Geliştirme Versiyonu İçin Base: 1.1.0
Son Dev Versiyonu: 
v1.1.0-dev.1
```

```bash
git tag -a v1.0.0-alpha.2 -m "Alpha release v1.0.0-alpha.2"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: v1.0.0-alpha.2
Geliştirme Versiyonu İçin Base: 1.1.0
Son Dev Versiyonu: 
v1.1.0-dev.1
```


### New Iteration after alpha
```bash
git tag -a v1.1.0-dev.1 -m "Development release v1.1.0-dev.1"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: v1.0.0-alpha.2
Geliştirme Versiyonu İçin Base: 1.1.0
Son Dev Versiyonu: v1.1.0-dev.1
v1.1.0-dev.2
```


```bash
git tag -a v1.1.0-dev.2 -m "Development release v1.1.0-dev.2"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: v1.0.0-alpha.2
Geliştirme Versiyonu İçin Base: 1.1.0
Son Dev Versiyonu: v1.1.0-dev.2
v1.1.0-dev.3
```

### second alpha
```bash
git tag -a v1.1.0-alpha.1 -m "Alpha release v1.1.0-alpha.1"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: v1.1.0-alpha.1
Geliştirme Versiyonu İçin Base: 1.2.0
Son Dev Versiyonu: 
v1.2.0-dev.1
```

```bash
git tag -a v1.2.0-dev.1 -m "Development release v1.2.0-dev.1"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: v1.1.0-alpha.1
Geliştirme Versiyonu İçin Base: 1.2.0
Son Dev Versiyonu: v1.2.0-dev.1
v1.2.0-dev.2
```

## Alpha Channel Tests

<!-- Test scenarios using semantic versioning principles -->

```bash
git tag -d $(git tag)
```

### Empty Tag

```bash
> ./versioning-alpha.sh --debug

Son Alpha Versiyonu: 
Yeni Alpha Versiyonu İçin Base: 1.0.0
v1.0.0-alpha.1
```

### Only Dev Tag, No Alpha

```bash
git tag -a v1.0.0-dev.1 -m "Development release v1.0.0-dev.1"
```

```bash
> ./versioning-alpha.sh --debug

Son Alpha Versiyonu: 
Yeni Alpha Versiyonu İçin Base: 1.0.0
v1.0.0-alpha.1
```

### With An Existing Alpha Version

```bash
git tag -a v1.0.0-alpha.1 -m "Alpha release v1.0.0-alpha.1"
```

```bash
> ./versioning-alpha.sh --debug

Son Alpha Versiyonu: v1.0.0-alpha.1
Yeni Alpha Versiyonu İçin Base: 1.0.0
v1.0.0-alpha.2
```

### With Multiple Alphas and Devs

```bash
git tag -a v1.0.0-dev.1 -m "Development release v1.0.0-dev.1"
git tag -a v1.0.0-alpha.2 -m "Alpha release v1.0.0-alpha.2"
```

```bash
> ./versioning-alpha.sh --debug

Son Alpha Versiyonu: v1.0.0-alpha.2
Yeni Alpha Versiyonu İçin Base: 1.0.0
v1.0.0-alpha.3
```

### Force Incrementing the Base Version

With the `--force-increment` flag, forcing the minor version increment despite existing alphas:

```bash
> ./versioning-alpha.sh --force-increment --debug

Son Alpha Versiyonu: v1.0.0-alpha.2
Yeni Alpha Versiyonu İçin Base: 1.1.0
v1.1.0-alpha.1
```

### New Iteration After Alpha

```bash
git tag -a v1.1.0-alpha.1 -m "Alpha release v1.1.0-alpha.1"
```

```bash
> "./versioning-alpha.sh --debug

Son Alpha Versiyonu: v1.1.0-alpha.1
Yeni Alpha Versiyonu İçin Base: 1.1.0
v1.1.0-alpha.2
```

```bash
> ./versioning-alpha.sh --force-increment --debug

Son Alpha Versiyonu: v1.1.0-alpha.1
Yeni Alpha Versiyonu İçin Base: 1.2.0
v1.2.0-alpha.1
```

This setup provides comprehensive scenarios to ensure that version increments behave as expected across different states of alpha and dev tags, including handling when only dev tags are present, alpha channels are populated, and forcing increments based on requirements.## Alpha Channel tests -->
