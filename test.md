## Dev Channel tests

<!-- aritmetik değerler kullanarak semver sıralama -->

```bash
git tag -d $(git tag)
```

### Empty tag
```bash
> ./versioning-dev.sh --debug

Son Alpha Versiyonu: 
Geliştirme Versiyonu İçin Base: 1.0.0
Son Dev Versiyonu: 
v1.0.0-dev.1
```


### Only dev tag, no alpha
```bash
git tag -a v1.0.0-dev.1 -m "Development release v1.0.0-dev.1"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: 
Geliştirme Versiyonu İçin Base: 1.0.0
Son Dev Versiyonu: v1.0.0-dev.1
v1.0.0-dev.2
```

```bash
git tag -a v1.0.0-dev.2 -m "Development release v1.0.0-dev.2"
```

```bash
> ./versioning-dev.sh --debug
Son Alpha Versiyonu: 
Geliştirme Versiyonu İçin Base: 1.0.0
Son Dev Versiyonu: v1.0.0-dev.1
v1.0.0-dev.2
```


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

This setup provides comprehensive scenarios to ensure that version increments behave as expected across different states of alpha and dev tags, including handling when only dev tags are present, alpha channels are populated, and forcing increments based on requirements.## Alpha Channel tests
