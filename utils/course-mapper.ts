import type { Course, Instructor, Product, RandomUser } from '@/types';

const expertiseByCategory:any = {
  smartphones: 'Mobile Product Design',
  laptops: 'Productivity Systems',
  fragrances: 'Brand Storytelling',
  skincare: 'Wellness Strategy',
  groceries: 'Consumer Essentials',
  "home-decoration": 'Interior Styling'
};

function toLevel(product: Product): Course['level'] {
  if (product.rating >= 4.5 || product.price >= 1200) {
    return 'Advanced';
  }

  if (product.rating >= 4.2 || product.price >= 700) {
    return 'Intermediate';
  }

  return 'Beginner';
}

export function mapUserToInstructor(user: RandomUser): Instructor {
  const name = [user.name.first, user.name.last].filter(Boolean).join(' ');
  const expertise = expertiseByCategory[user.nat?.toLowerCase() ?? ''] ?? 'Learning Experience Design';
  const country = user.location.country ?? 'Remote';

  return {
    id: user.id,
    name,
    email: user.email,
    avatar: user.picture.large,
    country,
    expertise,
    username: user.login.username,
    bio: `${name} helps learners turn ideas into repeatable skills with practical projects.`,
  };
}

export function mapProductToCourse(
  product: Product,
  instructor: Instructor,
  progress = 0
): Course {
  const lessonCount = Math.max(4, Math.round(product.rating * 2));
  const durationMinutes = Math.max(45, Math.round(product.price / 8));
  const level = toLevel(product);

  return {
    id: product.id,
    title: product.title,
    subtitle: `${product.brand} mastery sprint`,
    description: product.description,
    price: product.price,
    category: product.category,
    brand: product.brand,
    rating: product.rating,
    stock: product.stock,
    image: product.thumbnail,
    images: product.images,
    instructor,
    durationMinutes,
    lessonCount,
    level,
    spotlight: `${lessonCount} immersive lessons with live-style walkthroughs and portfolio prompts.`,
    progress,
    discountPercentage: product.discountPercentage,
  };
}
