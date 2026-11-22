/* Etkinlikler sayfasının (/events) verisi.
   ÖNEMLİ: Aşağıdaki etkinlikler ÖRNEKTİR (ornek: true). Yayında gerçek etkinlik göstermeden önce
   bunları gerçek organizatör bilgileriyle değiştir ve ornek alanını sil.

   Yeni etkinlik eklemek için ETKINLIKLER listesine bir satır ekle:
     id     : adreste görünen kısa ad (#etkinlik-id ile doğrudan açılır)
     ad     : etkinlik adı
     tur    : TURLER içindeki türlerden biri
     il     : ILLER içindeki il adı, ilce: ilçe adı
     mekan  : mekân adı
     tarih  : "YYYY-AA-GGTSS:DD" (Türkiye saati)
     bilet  : [ad, fiyat (TL), not, kalan adet]  (kalan 0 ise "Tükendi")
     link   : (isteğe bağlı) organizatörün kendi bilet sayfası. Varsa "Bilet al" oraya gider.
     org    : organizatör adı
     aciklama
*/
window.ETKINLIK = (function(){
  /* 81 il: plaka, ad, bölge. Haritada iğne çıkması için enlem/boylam gereken iller KONUM içinde. */
  var ILLER = [
    [1,'Adana','Akdeniz'],[2,'Adıyaman','Güneydoğu Anadolu'],[3,'Afyonkarahisar','Ege'],[4,'Ağrı','Doğu Anadolu'],[5,'Amasya','Karadeniz'],
    [6,'Ankara','İç Anadolu'],[7,'Antalya','Akdeniz'],[8,'Artvin','Karadeniz'],[9,'Aydın','Ege'],[10,'Balıkesir','Marmara'],
    [11,'Bilecik','Marmara'],[12,'Bingöl','Doğu Anadolu'],[13,'Bitlis','Doğu Anadolu'],[14,'Bolu','Karadeniz'],[15,'Burdur','Akdeniz'],
    [16,'Bursa','Marmara'],[17,'Çanakkale','Marmara'],[18,'Çankırı','İç Anadolu'],[19,'Çorum','Karadeniz'],[20,'Denizli','Ege'],
    [21,'Diyarbakır','Güneydoğu Anadolu'],[22,'Edirne','Marmara'],[23,'Elazığ','Doğu Anadolu'],[24,'Erzincan','Doğu Anadolu'],[25,'Erzurum','Doğu Anadolu'],
    [26,'Eskişehir','İç Anadolu'],[27,'Gaziantep','Güneydoğu Anadolu'],[28,'Giresun','Karadeniz'],[29,'Gümüşhane','Karadeniz'],[30,'Hakkari','Doğu Anadolu'],
    [31,'Hatay','Akdeniz'],[32,'Isparta','Akdeniz'],[33,'Mersin','Akdeniz'],[34,'İstanbul','Marmara'],[35,'İzmir','Ege'],
    [36,'Kars','Doğu Anadolu'],[37,'Kastamonu','Karadeniz'],[38,'Kayseri','İç Anadolu'],[39,'Kırklareli','Marmara'],[40,'Kırşehir','İç Anadolu'],
    [41,'Kocaeli','Marmara'],[42,'Konya','İç Anadolu'],[43,'Kütahya','Ege'],[44,'Malatya','Doğu Anadolu'],[45,'Manisa','Ege'],
    [46,'Kahramanmaraş','Akdeniz'],[47,'Mardin','Güneydoğu Anadolu'],[48,'Muğla','Ege'],[49,'Muş','Doğu Anadolu'],[50,'Nevşehir','İç Anadolu'],
    [51,'Niğde','İç Anadolu'],[52,'Ordu','Karadeniz'],[53,'Rize','Karadeniz'],[54,'Sakarya','Marmara'],[55,'Samsun','Karadeniz'],
    [56,'Siirt','Güneydoğu Anadolu'],[57,'Sinop','Karadeniz'],[58,'Sivas','İç Anadolu'],[59,'Tekirdağ','Marmara'],[60,'Tokat','Karadeniz'],
    [61,'Trabzon','Karadeniz'],[62,'Tunceli','Doğu Anadolu'],[63,'Şanlıurfa','Güneydoğu Anadolu'],[64,'Uşak','Ege'],[65,'Van','Doğu Anadolu'],
    [66,'Yozgat','İç Anadolu'],[67,'Zonguldak','Karadeniz'],[68,'Aksaray','İç Anadolu'],[69,'Bayburt','Karadeniz'],[70,'Karaman','İç Anadolu'],
    [71,'Kırıkkale','İç Anadolu'],[72,'Batman','Güneydoğu Anadolu'],[73,'Şırnak','Güneydoğu Anadolu'],[74,'Bartın','Karadeniz'],[75,'Ardahan','Doğu Anadolu'],
    [76,'Iğdır','Doğu Anadolu'],[77,'Yalova','Marmara'],[78,'Karabük','Karadeniz'],[79,'Kilis','Güneydoğu Anadolu'],[80,'Osmaniye','Akdeniz'],[81,'Düzce','Karadeniz']
  ].map(function(r){ return { plaka: r[0], ad: r[1], bolge: r[2] }; });

  /* il merkezlerinin yaklaşık konumu [enlem, boylam] */
  var KONUM = {
    'İstanbul':[41.01,28.98],'Ankara':[39.93,32.86],'İzmir':[38.42,27.14],'Antalya':[36.89,30.71],'Eskişehir':[39.78,30.52],
    'Trabzon':[41.0,39.72],'Gaziantep':[37.07,37.38],'Mardin':[37.31,40.74],'Nevşehir':[38.62,34.71],'Muğla':[37.21,28.36],
    'Bursa':[40.19,29.06],'Erzurum':[39.9,41.27],'Çanakkale':[40.15,26.41],'Konya':[37.87,32.48],'Şanlıurfa':[37.16,38.79],
    'Edirne':[41.68,26.56],'Samsun':[41.29,36.33],'Kars':[40.6,43.1],'Denizli':[37.78,29.09],'Hatay':[36.2,36.16]
  };

  /* İlçe listesi tam olan iller. Diğer illerde ilçe seçeneği, o ildeki etkinliklerin ilçelerinden oluşur. */
  var ILCELER = {
    'İstanbul':['Adalar','Arnavutköy','Ataşehir','Avcılar','Bağcılar','Bahçelievler','Bakırköy','Başakşehir','Bayrampaşa','Beşiktaş','Beykoz','Beylikdüzü','Beyoğlu','Büyükçekmece','Çatalca','Çekmeköy','Esenler','Esenyurt','Eyüpsultan','Fatih','Gaziosmanpaşa','Güngören','Kadıköy','Kağıthane','Kartal','Küçükçekmece','Maltepe','Pendik','Sancaktepe','Sarıyer','Silivri','Sultanbeyli','Sultangazi','Şile','Şişli','Tuzla','Ümraniye','Üsküdar','Zeytinburnu'],
    'Ankara':['Akyurt','Altındağ','Ayaş','Bala','Beypazarı','Çamlıdere','Çankaya','Çubuk','Elmadağ','Etimesgut','Evren','Gölbaşı','Güdül','Haymana','Kahramankazan','Kalecik','Keçiören','Kızılcahamam','Mamak','Nallıhan','Polatlı','Pursaklar','Sincan','Şereflikoçhisar','Yenimahalle'],
    'İzmir':['Aliağa','Balçova','Bayındır','Bayraklı','Bergama','Beydağ','Bornova','Buca','Çeşme','Çiğli','Dikili','Foça','Gaziemir','Güzelbahçe','Karabağlar','Karaburun','Karşıyaka','Kemalpaşa','Kınık','Kiraz','Konak','Menderes','Menemen','Narlıdere','Ödemiş','Seferihisar','Selçuk','Tire','Torbalı','Urla']
  };

  var BOLGELER = ['Marmara','Ege','Akdeniz','İç Anadolu','Karadeniz','Doğu Anadolu','Güneydoğu Anadolu'];
  var TURLER = { 'Konser':['#7A2E2A','#2B1A1F'], 'Tiyatro':['#4E3A6E','#1E1A2E'], 'Söyleşi':['#1F5C8A','#14202E'], 'Atölye':['#3F6B4E','#18261F'], 'Gezi':['#A0561F','#3A2414'], 'Festival':['#9C6B1E','#3B2A12'], 'Çocuk':['#2F7C8C','#14303A'] };

  var B = function(ad, fiyat, not, kalan){ return { ad: ad, fiyat: fiyat, not: not || '', kalan: kalan }; };
  var ETKINLIKLER = [
    { id:'kadikoy-akustik', ornek:true, ad:"Moda'da Akustik Gece", tur:'Konser', il:'İstanbul', ilce:'Kadıköy', mekan:'Moda Sahili Amfi', tarih:'2026-11-28T21:00', org:'Örnek organizatör', bilet:[B('Genel giriş',350,'Ayakta',40),B('Ön sıra',550,'Oturmalı, ilk 3 sıra',8)], aciklama:'Üç genç akustik grup, deniz kenarında açık havada. Battaniyeni getir, sıcak çay ikram.' },
    { id:'beyoglu-dogaclama', ornek:true, ad:'Doğaçlama Tiyatro Gecesi', tur:'Tiyatro', il:'İstanbul', ilce:'Beyoğlu', mekan:'Galata Küçük Sahne', tarih:'2026-11-27T20:00', org:'Örnek organizatör', bilet:[B('Tam',380,'',18),B('Öğrenci',260,'Öğrenci belgesiyle',10)], aciklama:'Konuları seyirci veriyor, oyuncular anında sahneye koyuyor. Her gece başka bir oyun.' },
    { id:'fatih-bizans-yuruyus', ornek:true, ad:'Suriçi Bizans Yürüyüşü', tur:'Gezi', il:'İstanbul', ilce:'Fatih', mekan:'Sultanahmet Meydanı buluşma', tarih:'2026-12-06T10:00', org:'Örnek organizatör', bilet:[B('Katılım',600,'Rehberli, 3 saat',20)], aciklama:'Hipodromdan Sarnıç\'a, Ayasofya\'dan surlara Bizans İstanbul\'u. Tarihçi rehber eşliğinde.' },
    { id:'uskudar-caz', ornek:true, ad:'Üsküdar Sahilde Caz', tur:'Konser', il:'İstanbul', ilce:'Üsküdar', mekan:'Şemsi Paşa Sahili', tarih:'2026-12-05T19:30', org:'Örnek organizatör', bilet:[B('Genel giriş',450,'',12),B('Masa (4 kişi)',2200,'İkram dahil',2)], aciklama:'Kız Kulesi manzarasında caz dörtlüsü. Gün batımından hemen sonra başlar.' },
    { id:'sisli-kukla', ornek:true, ad:'Kukla Tiyatrosu: Uçan Simit', tur:'Çocuk', il:'İstanbul', ilce:'Şişli', mekan:'Nişantaşı Çocuk Sahnesi', tarih:'2026-11-28T11:00', org:'Örnek organizatör', bilet:[B('Çocuk',220,'3–9 yaş',30),B('Yetişkin refakatçi',120,'',30)], aciklama:'Bir simitin İstanbul turu. 45 dakika, oyun sonrası kukla yapımı.' },
    { id:'cankaya-oda-muzigi', ornek:true, ad:'Tunalı\'da Oda Müziği', tur:'Konser', il:'Ankara', ilce:'Çankaya', mekan:'Kavaklıdere Sanat Evi', tarih:'2026-12-04T20:00', org:'Örnek organizatör', bilet:[B('Tam',300,'',35),B('Öğrenci',180,'',15)], aciklama:'Yaylı dörtlüden Haydn ve Saygun. Konser öncesi 15 dakikalık eser tanıtımı.' },
    { id:'beypazari-gezi', ornek:true, ad:'Beypazarı Konakları Günübirlik Gezi', tur:'Gezi', il:'Ankara', ilce:'Beypazarı', mekan:'Kızılay kalkış', tarih:'2026-12-13T08:30', org:'Örnek organizatör', bilet:[B('Ulaşım + rehber',900,'Öğle yemeği hariç',22)], aciklama:'Osmanlı konakları, gümüş işçiliği atölyeleri ve çarşı. Dönüş 19:00 civarı.' },
    { id:'konak-kordon', ornek:true, ad:'Kordon\'da Gün Batımı Konseri', tur:'Konser', il:'İzmir', ilce:'Konak', mekan:'Kordon Açık Hava', tarih:'2026-11-29T17:30', org:'Örnek organizatör', bilet:[B('Genel giriş',250,'',80)], aciklama:'Körfeze karşı gün batımında Ege türküleri ve akustik setler.' },
    { id:'selcuk-efes-felsefe', ornek:true, ad:'Efes\'te Herakleitos Söyleşisi', tur:'Söyleşi', il:'İzmir', ilce:'Selçuk', mekan:'Efes Antik Kenti girişi', tarih:'2026-12-12T15:00', org:'Antikyol', bilet:[B('Söyleşi + rehberli yürüyüş',750,'Müze girişi hariç',25)], aciklama:'"Aynı nehirde iki kez yıkanılmaz." Celsus Kütüphanesi önünde açılış, Büyük Tiyatro\'da söyleşi.' },
    { id:'urla-zeytin', ornek:true, ad:'Urla Zeytin Hasadı Atölyesi', tur:'Atölye', il:'İzmir', ilce:'Urla', mekan:'Bademler köyü', tarih:'2026-12-06T10:00', org:'Örnek organizatör', bilet:[B('Atölye',850,'Öğle yemeği dahil',14)], aciklama:'Hasada katıl, taş değirmende sıkım izle, zeytinyağı tadımı yap.' },
    { id:'muratpasa-kaleici-caz', ornek:true, ad:'Kaleiçi Kış Caz Gecesi', tur:'Konser', il:'Antalya', ilce:'Muratpaşa', mekan:'Kaleiçi Hadrian Kapısı yanı', tarih:'2026-12-19T21:00', org:'Örnek organizatör', bilet:[B('Genel giriş',400,'',0)], aciklama:'Kaleiçi\'nin taş avlusunda caz. Biletler tükendi.' },
    { id:'odunpazari-cam', ornek:true, ad:'Odunpazarı Cam Atölyesi', tur:'Atölye', il:'Eskişehir', ilce:'Odunpazarı', mekan:'Odunpazarı Cam Evi', tarih:'2026-11-29T14:00', org:'Örnek organizatör', bilet:[B('Atölye',650,'2 saat, malzeme dahil',8)], aciklama:'Cam üfleme gösterisi ve kendi boncuğunu yapma.' },
    { id:'ortahisar-kemence', ornek:true, ad:'Kemençe ve Horon Gecesi', tur:'Festival', il:'Trabzon', ilce:'Ortahisar', mekan:'Ortahisar Kültür Merkezi', tarih:'2026-12-11T20:00', org:'Örnek organizatör', bilet:[B('Genel giriş',220,'',90)], aciklama:'Karadeniz ezgileri, canlı kemençe ve herkesin katıldığı horon.' },
    { id:'sahinbey-gastronomi', ornek:true, ad:'Antep Mutfağı Lezzet Yürüyüşü', tur:'Gezi', il:'Gaziantep', ilce:'Şahinbey', mekan:'Bakırcılar Çarşısı buluşma', tarih:'2026-12-14T11:00', org:'Örnek organizatör', bilet:[B('Yürüyüş + 6 tadım',950,'',16)], aciklama:'Beyran\'dan katmere, baklavadan menengiç kahvesine 6 durak.' },
    { id:'artuklu-foto', ornek:true, ad:'Mardin Taş Sokaklar Fotoğraf Yürüyüşü', tur:'Atölye', il:'Mardin', ilce:'Artuklu', mekan:'Kasımiye Medresesi önü', tarih:'2026-12-20T09:00', org:'Örnek organizatör', bilet:[B('Katılım',500,'Telefonla da katılabilirsin',12)], aciklama:'Sabah ışığında Mezopotamya ovasına bakan sokaklarda kompozisyon ve ışık.' },
    { id:'urgup-gun-dogumu', ornek:true, ad:'Kapadokya Gün Doğumu Yürüyüşü', tur:'Gezi', il:'Nevşehir', ilce:'Ürgüp', mekan:'Güvercinlik Vadisi girişi', tarih:'2026-12-07T06:30', org:'Örnek organizatör', bilet:[B('Katılım',450,'Sıcak çorba dahil',30)], aciklama:'Balonların kalktığı saatte vadide 6 km yürüyüş.' },
    { id:'bodrum-film', ornek:true, ad:'Bodrum Kış Film Günleri', tur:'Festival', il:'Muğla', ilce:'Bodrum', mekan:'Bodrum Kalesi avlusu', tarih:'2026-12-18T19:00', org:'Örnek organizatör', bilet:[B('Tek gösterim',180,'',100),B('Festival kartı',600,'4 gösterim',40)], aciklama:'Akdeniz sinemasından seçkiler ve yönetmen söyleşileri.' },
    { id:'osmangazi-karagoz', ornek:true, ad:'Karagöz ile Hacivat', tur:'Çocuk', il:'Bursa', ilce:'Osmangazi', mekan:'Tophane Gölge Oyunu Sahnesi', tarih:'2026-11-29T13:00', org:'Örnek organizatör', bilet:[B('Çocuk',150,'',40),B('Yetişkin',200,'',40)], aciklama:'Geleneksel gölge oyunu ve gösteri sonrası tasvir boyama.' },
    { id:'palandoken-kayak', ornek:true, ad:'Palandöken Kayağa Başlangıç Kampı', tur:'Atölye', il:'Erzurum', ilce:'Palandöken', mekan:'Palandöken Kayak Merkezi', tarih:'2026-12-26T09:00', org:'Örnek organizatör', bilet:[B('1 gün, ekipman dahil',1800,'',10)], aciklama:'Hiç kaymamış olanlar için eğitmenli bir gün. Ekipman ve teleferik dahil.' },
    { id:'troya-soylesi', ornek:true, ad:'Troya\'da İlyada Okuması', tur:'Söyleşi', il:'Çanakkale', ilce:'Merkez', mekan:'Troya Müzesi', tarih:'2026-12-13T14:00', org:'Antikyol', bilet:[B('Söyleşi',300,'Müze girişi hariç',40)], aciklama:'Homeros\'tan seçme bölümler, ardından antik kentte kısa yürüyüş.' },
    { id:'konya-sema', ornek:true, ad:'Şeb-i Arus Haftası Söyleşisi', tur:'Söyleşi', il:'Konya', ilce:'Karatay', mekan:'Mevlana Kültür Merkezi', tarih:'2026-12-15T18:00', org:'Örnek organizatör', bilet:[B('Söyleşi',0,'Ücretsiz, kayıt gerekli',120)], aciklama:'Mevlana\'nın düşüncesi üzerine söyleşi ve ardından sema gösterisi.' }
  ];
  /* ======================================================================
     HAFTANIN SEÇKİSİ: senin kendi seçtiğin, gittiğin ya da önerdiğin etkinlikler.
     Olgular (tarih, mekân, fiyat) yukarıdaki ETKINLIKLER listesinden otomatik gelir;
     buraya yalnızca KENDİ sözlerini yaz. Boş bıraktığın alan sitede hiç görünmez.

       hafta    : seçkinin başladığı pazartesi, "YYYY-AA-GG"
       baslik   : ör. "Bu hafta Kadıköy'de"
       il, ilce : seçkinin yeri (ilce boş olabilir)
       yazar    : imza, ör. "Simge"
       giris    : 2-3 cümlelik kişisel giriş
       taslak   : true iken sitede gizli, yalnızca /events?taslak adresinde görünür.
                  Yazını bitirince false yap.
       secimler : [{ etkinlik: 'etkinlik-id',
                     gittim: true yalnızca gerçekten gittiysen ("Gittim" rozeti),
                     mutlaka: true ise "Mutlaka git" olarak öne çıkar,
                     yorum: kendi yorumun }]
     ====================================================================== */
  var SECKILER = [
    { id:'2026-11-23-istanbul', hafta:'2026-11-23', baslik:"Bu hafta İstanbul'da", il:'İstanbul', ilce:'', yazar:'', taslak:true,
      giris:'',
      secimler:[
        { etkinlik:'kadikoy-akustik', gittim:false, mutlaka:false, yorum:'' },
        { etkinlik:'beyoglu-dogaclama', gittim:false, mutlaka:false, yorum:'' },
        { etkinlik:'sisli-kukla', gittim:false, mutlaka:false, yorum:'' }
      ] }
  ];
  return { ILLER: ILLER, KONUM: KONUM, ILCELER: ILCELER, BOLGELER: BOLGELER, TURLER: TURLER, ETKINLIKLER: ETKINLIKLER, SECKILER: SECKILER, HIZMET: 0.05 };
})();
