import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui'

export default function Home() {
  return (
    <main className="container-custom section-padding">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tech Blog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A modern tech blog built with Next.js and Tailwind CSS
        </p>
        <div className="flex gap-4 justify-center">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Design System</CardTitle>
            <CardDescription>
              Complete design system with reusable components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Badge>React</Badge>
              <Badge variant="secondary">Next.js</Badge>
              <Badge variant="outline">Tailwind</Badge>
            </div>
            <p className="text-muted-foreground">
              Built with modern web technologies and best practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utility Functions</CardTitle>
            <CardDescription>
              Helper functions for common operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Badge>Date Formatting</Badge>
              <Badge variant="secondary">Reading Time</Badge>
            </div>
            <p className="text-muted-foreground">
              Essential utilities for blog functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Styles</CardTitle>
            <CardDescription>
              Comprehensive styling with CSS variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Badge>Dark Mode</Badge>
              <Badge variant="secondary">Responsive</Badge>
            </div>
            <p className="text-muted-foreground">
              Beautiful, accessible, and responsive design.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Phase 1 Complete! ✅</h2>
        <p className="text-muted-foreground">
          Project setup, design system, and core components are ready.
        </p>
      </div>
    </main>
  )
}
