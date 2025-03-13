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
