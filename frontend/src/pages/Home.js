import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineArrowRight, HiOutlineTruck, HiOutlineRefresh, 
  HiOutlineShieldCheck, HiOutlineCreditCard, HiOutlineSparkles,
  HiOutlineStar, HiOutlineHeart
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import ProductCard from '../components/products/ProductCard';
import Loading from '../components/common/Loading';
import { productAPI, newsletterAPI } from '../services/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featuredRes, newRes] = await Promise.all([
          productAPI.getFeatured(8),
          productAPI.getNewArrivals(8),
        ]);

        setFeaturedProducts(featuredRes.data.data || []);
        setNewArrivals(newRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading size="large" text="Loading amazing products..." />;
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Full Width Modern Design with 4K Background */}
      <section className="relative min-h-screen flex items-center">
        {/* 4K Pakistani Fashion Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=3840&auto=format&fit=crop')`,
          }}
        >
          {/* Dark Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40"></div>
          {/* Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-white space-y-8 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <HiOutlineSparkles className="w-5 h-5 text-gold-400 animate-pulse" />
                  <span className="text-sm font-medium">New Collection 2025</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                  Elegance
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                    Redefined
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                  Discover our exquisite collection of traditional and contemporary Pakistani fashion, 
                  crafted with love and precision for the modern woman.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to="/shop" 
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-full hover:from-gold-600 hover:to-gold-700 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-gold-500/30"
                  >
                    Shop Now
                    <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/shop?sort=newest" 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all duration-300"
                  >
                    New Arrivals
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex gap-12 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold-400">500+</div>
                    <div className="text-sm text-gray-400">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold-400">10K+</div>
                    <div className="text-sm text-gray-400">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gold-400">4.9</div>
                    <div className="text-sm text-gray-400">Rating</div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="relative animate-float">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 to-transparent rounded-3xl transform rotate-6"></div>
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop"
                    alt="Fashion Model"
                    className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto object-cover"
                  />
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 animate-bounce-slow">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
                        <HiOutlineStar className="w-6 h-6 text-gold-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">Best Seller</div>
                        <div className="text-sm text-gray-500">This Month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Bar - Modern Glass Effect */}
      <section className="relative -mt-20 z-20 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: HiOutlineTruck, title: 'Free Shipping', desc: 'On orders over PKR 5,000' },
              { icon: HiOutlineRefresh, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: HiOutlineShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: HiOutlineCreditCard, title: 'COD Available', desc: 'Cash on delivery' },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Modern Grid */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4 animate-fade-in">
              Collections
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4 animate-fade-in-up">
              Shop by Style
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg animate-fade-in-up delay-200">
              Discover our stunning collection of women's fashion for every occasion
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" style={{ perspective: '1000px' }}>
            {[
              { name: 'Casual Wear', slug: 'casual', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop', color: 'from-emerald-600/90' },
              { name: 'Party Wear', slug: 'party-wear', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&h=1000&fit=crop', color: 'from-fuchsia-600/90' },
              { name: 'Formal', slug: 'formal', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop', color: 'from-slate-700/90' },
              { name: 'Bridal', slug: 'bridal', image: 'https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?w=800&h=1000&fit=crop', color: 'from-rose-600/90' },
              { name: 'Festive', slug: 'festive', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop', color: 'from-amber-600/90' },
              { name: 'New Arrivals', slug: 'new-arrivals', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop', color: 'from-cyan-600/90' },
            ].map((category, index) => (
              <Link
                key={index}
                to={`/shop?category=${category.slug}`}
                className="category-card group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-lg hover:shadow-2xl"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  transform: 'translateZ(0)',
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) rotateX(5deg) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Image with zoom effect */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-115"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500`}></div>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                {/* Content */}
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <div className="text-center transform transition-all duration-500 group-hover:-translate-y-2">
                    <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-3 drop-shadow-lg">
                      {category.name}
                    </h3>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      Explore <HiOutlineArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
                Featured
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800">
                Featured Products
              </h2>
            </div>
            <Link 
              to="/shop" 
              className="group inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 mt-4 md:mt-0"
            >
              View All Products
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No featured products yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* Banner Section - Full Width */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=800&fit=crop"
            alt="Collection Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/70"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <span className="inline-block px-6 py-2 bg-gold-500 rounded-full text-sm font-bold mb-6 animate-pulse">
            Limited Time Offer
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Up to 50% Off
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Don't miss out on our biggest sale of the season. Shop now and save big on your favorite styles.
          </p>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary-700 font-bold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Shop Sale
            <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium mb-4">
                Just In
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800">
                New Arrivals
              </h2>
            </div>
            <Link 
              to="/shop?sort=newest" 
              className="group inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 mt-4 md:mt-0"
            >
              View All New Arrivals
              <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, index) => (
                <div 
                  key={product._id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              New arrivals coming soon!
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-white text-primary-700 rounded-full text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ayesha Khan', location: 'Lahore', text: 'Absolutely love the quality! The embroidery work is exquisite and the fabric is so comfortable. Will definitely order again!', rating: 5 },
              { name: 'Fatima Ahmed', location: 'Karachi', text: 'Fast delivery and excellent customer service. The dress looked exactly like the pictures. Highly recommended!', rating: 5 },
              { name: 'Sara Malik', location: 'Islamabad', text: 'Beautiful collection and reasonable prices. The stitching quality exceeded my expectations. Thank you Meraab & Emaan!', rating: 5 },
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HiOutlineStar key={i} className="w-5 h-5 text-gold-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <HiOutlineHeart className="w-16 h-16 mx-auto mb-6 text-gold-400" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Join Our Family
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to get exclusive offers, early access to new collections, and styling tips.
          </p>
          <form 
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newsletterEmail) {
                toast.error('Please enter your email');
                return;
              }
              try {
                setSubscribing(true);
                await newsletterAPI.subscribe(newsletterEmail);
                toast.success('Successfully subscribed! Check your email for confirmation.');
                setNewsletterEmail('');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
              } finally {
                setSubscribing(false);
              }
            }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
            <button 
              type="submit"
              disabled={subscribing}
              className="px-8 py-4 bg-gold-500 text-white font-semibold rounded-full hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
