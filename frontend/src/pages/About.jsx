import { useTranslation } from 'react-i18next';
import { FaMosque, FaHeart, FaUsers, FaBook, FaPrayingHands, FaHandshake } from 'react-icons/fa';

export default function About() {
  const { i18n } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-islamic-green via-islamic-darkGreen to-teal-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <FaMosque className="text-6xl mx-auto mb-6 text-islamic-gold animate-float" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {i18n.language === 'ar' ? 'عن مسجدنا' : 
             i18n.language === 'bg' ? 'За нас' : 
             'About Us'}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            {i18n.language === 'ar' ? 'مركز إسلامي في قلب حي الطلاب بصوفيا' :
             i18n.language === 'bg' ? 'Ислямски център в сърцето на студентския квартал в София' :
             'Islamic Center in the heart of Sofia\'s student district'}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="card-modern p-10 mb-12">
            <h2 className="text-4xl font-bold mb-6 text-center gradient-text">
              {i18n.language === 'ar' ? 'مهمتنا' : 
               i18n.language === 'bg' ? 'Нашата мисия' : 
               'Our Mission'}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
              {i18n.language === 'ar' ? 
                'مسجد ستودينتسكي غراد هو مكان للعبادة والتعليم والتواصل المجتمعي للمسلمين في صوفيا. نسعى لتوفير بيئة ترحيبية لجميع المسلمين وغير المسلمين المهتمين بالتعرف على الإسلام.' :
               i18n.language === 'bg' ? 
                'Джамия Студентски град е място за поклонение, образование и обществена връзка за мюсюлманите в София. Стремим се да осигурим приветлива среда за всички мюсюлмани и немюсюлмани, които се интересуват да научат повече за исляма.' :
                'Masjid Studentski Grad is a place of worship, education, and community connection for Muslims in Sofia. We strive to provide a welcoming environment for all Muslims and non-Muslims interested in learning about Islam.'}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              {i18n.language === 'ar' ? 
                'نلتزم بخدمة المجتمع من خلال الأنشطة الدينية والتعليمية والاجتماعية، مع احترام التنوع والتعايش السلمي.' :
               i18n.language === 'bg' ? 
                'Ние сме ангажирани да служим на общността чрез религиозни, образователни и социални дейности, уважавайки разнообразието и мирното съвместно съществуване.' :
                'We are committed to serving the community through religious, educational, and social activities, while respecting diversity and peaceful coexistence.'}
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="card-modern p-6 text-center group">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-islamic-green opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
                <FaPrayingHands className="text-5xl text-islamic-green mx-auto relative" />
              </div>
              <h3 className="text-xl font-bold mb-3 gradient-text">
                {i18n.language === 'ar' ? 'العبادة' : 
                 i18n.language === 'bg' ? 'Поклонение' : 
                 'Worship'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' ? 'نقيم الصلوات الخمس اليومية وصلاة الجمعة' :
                 i18n.language === 'bg' ? 'Провеждаме петте ежедневни молитви и петъчната молитва' :
                 'We hold the five daily prayers and Friday prayer'}
              </p>
            </div>

            <div className="card-modern p-6 text-center group">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-islamic-gold opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
                <FaBook className="text-5xl text-islamic-gold mx-auto relative" />
              </div>
              <h3 className="text-xl font-bold mb-3 gradient-text">
                {i18n.language === 'ar' ? 'التعليم' : 
                 i18n.language === 'bg' ? 'Образование' : 
                 'Education'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' ? 'نوفر دروس القرآن والعلوم الإسلامية' :
                 i18n.language === 'bg' ? 'Предлагаме уроци по Коран и ислямски знания' :
                 'We offer Quran classes and Islamic knowledge'}
              </p>
            </div>

            <div className="card-modern p-6 text-center group">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-red-500 opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity"></div>
                <FaHandshake className="text-5xl text-red-500 mx-auto relative" />
              </div>
              <h3 className="text-xl font-bold mb-3 gradient-text">
                {i18n.language === 'ar' ? 'المجتمع' : 
                 i18n.language === 'bg' ? 'Общност' : 
                 'Community'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' ? 'نبني مجتمعاً متماسكاً ومتعاوناً' :
                 i18n.language === 'bg' ? 'Изграждаме сплотена и взаимопомагаща общност' :
                 'Building a cohesive and supportive community'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
            {i18n.language === 'ar' ? 'خدماتنا' : 
             i18n.language === 'bg' ? 'Нашите услуги' : 
             'Our Services'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🕌</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'الصلوات اليومية' : 
                 i18n.language === 'bg' ? 'Ежедневни молитви' : 
                 'Daily Prayers'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'خمس صلوات يومية في جماعة' :
                 i18n.language === 'bg' ? 'Пет ежедневни молитви в джамаат' :
                 'Five daily prayers in congregation'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'خطبة الجمعة' : 
                 i18n.language === 'bg' ? 'Петъчна проповед' : 
                 'Friday Khutbah'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'خطب أسبوعية ملهمة' :
                 i18n.language === 'bg' ? 'Вдъхновяващи седмични проповеди' :
                 'Weekly inspiring sermons'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'دروس القرآن' : 
                 i18n.language === 'bg' ? 'Уроци по Коран' : 
                 'Quran Classes'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'تعليم القرآن والتجويد' :
                 i18n.language === 'bg' ? 'Обучение по Коран и таджвид' :
                 'Quran and Tajweed instruction'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'الفعاليات المجتمعية' : 
                 i18n.language === 'bg' ? 'Обществени събития' : 
                 'Community Events'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'احتفالات وأنشطة اجتماعية' :
                 i18n.language === 'bg' ? 'Празненства и социални дейности' :
                 'Celebrations and social activities'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">💒</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'خدمات الزواج' : 
                 i18n.language === 'bg' ? 'Сватбени услуги' : 
                 'Marriage Services'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'عقد القران والاستشارات' :
                 i18n.language === 'bg' ? 'Сключване на брак и консултации' :
                 'Nikah ceremonies and counseling'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'برامج رمضان' : 
                 i18n.language === 'bg' ? 'Рамаданови програми' : 
                 'Ramadan Programs'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'إفطار وتراويح يومية' :
                 i18n.language === 'bg' ? 'Ежедневен ифтар и таравих' :
                 'Daily Iftar and Taraweeh'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">💝</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'الزكاة والصدقة' : 
                 i18n.language === 'bg' ? 'Закят и Садака' : 
                 'Zakat & Sadaqah'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'جمع وتوزيع الزكاة' :
                 i18n.language === 'bg' ? 'Събиране и разпределение на закят' :
                 'Collection and distribution'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
              <div className="text-4xl mb-4">🕋</div>
              <h3 className="font-bold text-lg mb-2 text-islamic-darkGreen">
                {i18n.language === 'ar' ? 'خدمات الحج والعمرة' : 
                 i18n.language === 'bg' ? 'Хадж и Умра услуги' : 
                 'Hajj & Umrah'}
              </h3>
              <p className="text-gray-600 text-sm">
                {i18n.language === 'ar' ? 'إرشادات وتنظيم الرحلات' :
                 i18n.language === 'bg' ? 'Консултации и организация' :
                 'Guidance and organization'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-islamic-green mb-2 pulse-glow">5</div>
              <p className="text-gray-600 font-semibold">
                {i18n.language === 'ar' ? 'صلوات يومية' : 
                 i18n.language === 'bg' ? 'Дневни молитви' : 
                 'Daily Prayers'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-islamic-gold mb-2 pulse-glow">52</div>
              <p className="text-gray-600 font-semibold">
                {i18n.language === 'ar' ? 'خطب سنوياً' : 
                 i18n.language === 'bg' ? 'Проповеди годишно' : 
                 'Khutbahs Yearly'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-islamic-green mb-2 pulse-glow">30</div>
              <p className="text-gray-600 font-semibold">
                {i18n.language === 'ar' ? 'ليلة رمضان' : 
                 i18n.language === 'bg' ? 'Рамадански вечери' : 
                 'Ramadan Nights'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-islamic-gold mb-2 pulse-glow">∞</div>
              <p className="text-gray-600 font-semibold">
                {i18n.language === 'ar' ? 'أفراد المجتمع' : 
                 i18n.language === 'bg' ? 'Членове на общността' : 
                 'Community Members'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-islamic-green via-islamic-darkGreen to-teal-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              {i18n.language === 'ar' ? 'تواصل معنا' : 
               i18n.language === 'bg' ? 'Свържете се с нас' : 
               'Contact Us'}
            </h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    <FaMosque /> 
                    {i18n.language === 'ar' ? 'العنوان' : 
                     i18n.language === 'bg' ? 'Адрес' : 
                     'Address'}
                  </h3>
                  <p>Studentski Grad, Sofia, Bulgaria</p>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    📧 
                    {i18n.language === 'ar' ? 'البريد الإلكتروني' : 
                     i18n.language === 'bg' ? 'Имейл' : 
                     'Email'}
                  </h3>
                  <p>info@masjidstudentskigrad.com</p>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    📞 
                    {i18n.language === 'ar' ? 'الهاتف' : 
                     i18n.language === 'bg' ? 'Телефон' : 
                     'Phone'}
                  </h3>
                  <p>+359 XX XXX XXXX</p>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    ⏰ 
                    {i18n.language === 'ar' ? 'ساعات العمل' : 
                     i18n.language === 'bg' ? 'Работно време' : 
                     'Hours'}
                  </h3>
                  <p>
                    {i18n.language === 'ar' ? 'مفتوح للصلوات الخمس' : 
                     i18n.language === 'bg' ? 'Отворена за петте молитви' : 
                     'Open for five daily prayers'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-lg opacity-90">
              {i18n.language === 'ar' ? 'الجميع مرحب به في مسجدنا' : 
               i18n.language === 'bg' ? 'Всички са добре дошли в нашата джамия' : 
               'Everyone is welcome at our mosque'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
