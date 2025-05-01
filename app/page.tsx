import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          SkillKart
        </h1>
        <p className="text-xl md:text-2xl mt-4 max-w-3xl text-muted-foreground">
          A personalized learning roadmap platform with gamification and community features
        </p>
        <div className="flex gap-4 mt-8">
          <Button asChild size="lg">
            <Link href="/auth">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Personalized Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Learn at your own pace with custom roadmaps tailored to your skills, goals, and available time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Curated Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Access high-quality learning materials selected by experts in the field.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Connect with other learners, share your progress, and get help when you need it.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8">Ready to start your learning journey?</h2>
        <Button size="lg" asChild>
          <Link href="/auth">Sign Up Now</Link>
        </Button>
      </div>
    </div>
  )
}