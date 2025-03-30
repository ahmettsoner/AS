# Version Belirleme ve Tespit

## Terimler

- **LABBV**: Lastest Alpha Branch Base Version
  Alpha channel'da bulunan en son version bilgisi. `release/vX.Y.0-alpha.N` branch'ının `X.Y.0` değeri. Release branch'inde test fazında olan versiyonun alpha release çalışmaları
- **LDTBV**: Latest Dev Tag Base Version
  Dev channel'da bulunan en son version bilgisi. `vX.Y.0-dev.N` tagının `X.Y.0` değeri. dev branchinde dev fazında üzerinde çalışılan versionun dev release'ları
- **NDCBV**: Next Dev Channel Base Version
  Dev channel'da bulunan şu anda çalışılan version bilgisi. Dev tag veya alpha branch'ten tespit edilir
## Dev Branch için version belirleme

Dev branch'te iterasyon boyunca geliştirme yapılır. versiyon sıralamaları semver'e uygun olarak yapılır

- Release version bilgisi alpha release branch baz alınır
  - Alpha branch'ten semver ile sıralanmış olarak son versin bilgisi alınır `LABBV`
    - `LABBV` boşsa, dev branch'te `LDTBV` tespit edilir semver sıralama ile en yüksek base version
      - `LDTBV` boşsa, default `v1.0.0` `NDCBV` olarak set edilir
      - `LDTBV` varsa, `LABBV` olmadığı için ilk çalışma olduğu varsayılır, çünkü iteration sonunda dev fazdan test faz'a geçilir ve bir alpha branch oluşturularak kodlar korunur ve geliştirmeye kapatılır.
        bu durumda dev tag varsa `NDCBV` dur ve ilk iteration version'dur ve `LDTBV` = `NDCBV` olarak kabul edilir
    - `LABBV` varsa, en az bir defa test faz başlatılmış demektir ve dev faz bir sonraki versiyon için çalışılıyor demektir.
      yine dev `LABBV`'dan minor+1 olmalı. yine `LDTBV` tespit edilir ve `LABBV` ile karşılaştırılır
      - `LABBV` >= `LDTBV` ise `NDCBV` = `LABBV` minor increment olur, bu dev branch'te release çıkılmamış iteration'lar olabileceği için dev tag'ın geride kalabileceği durumunda alpha'nın baz alınmasını sağlar
      - `LABBV` < `LDTBV` ise `NDCBV` = `LDTBV` olur, bu dev branch'te alpha+minor1 için iteration sürecinde daha önce dev channel release tanımlandığını belirtir



* `vereasy phase dev` shows default and only current version for development phase based on dev branch generally `dev`
  * `--current`: default version state, automatically calculated based on default test phase primary channel (alpha)
  * `--print`: 
    * `base`: base version (v1.0.0), 
    * `version`: without prefix (1.0.0) 
    * `channel`: channel name (dev), 
    * `build`: build number, channel number (1) 
    * `full`: default, full version (v1.0.0-dev.1)
* `vereasy phase test <channel>` shows default current. (alpha)
  * `--next`: show next base version calculated
    * `version`: for primary test phase channel, same as `vereasy phase dev --print=base` minor incremented based on step after primary test channel (alpha).
    * ? for other
    * `release`: latest test phase <channel> version build number incremented
  * `--current`: current version info
  * `--latest`: latest version info
  * `--print`: same as `vereasy phase dev`
* `vereasy phase stage <channel>` shows default current. generally one stage version (beta, rc, preview)
  * `--next`: show next base version calculated
    * `version`: 
    * `release`: latest stage phase <channel> version build number incremented
  * `--current`: current version info
  * `--print`: same as `vereasy phase dev`
* `vereasy phase production` shows default current. only one version and patches (stabil/final)
  * `--next`: show next base version calculated
    * `version`: 
    * `release`: latest production version minor/patch number incremented
  * `--current`: current version info
  * `--print`: same as `vereasy phase dev`
