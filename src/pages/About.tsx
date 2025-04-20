import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, GraduationCap, Brain, Lightbulb, HeartHandshake, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">About Our Learning Platform</h1>
        
        <div className="space-y-8">
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  Our Mission
                </CardTitle>
                <CardDescription>
                  Empowering learners with adaptive and personalized education
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">
                  Our platform combines cutting-edge technology with educational best practices to create a 
                  personalized learning experience. We believe that education should adapt to each learner's 
                  unique needs, pace, and emotional state.
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  By tracking emotional responses and attention levels, we can optimize content delivery and 
                  provide a more effective and engaging learning journey for every student.
                </p>
              </CardContent>
            </Card>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Emotion Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Our platform analyzes facial expressions to detect emotions during learning,
                    helping to personalize content based on your engagement level.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Adaptive Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Content difficulty and presentation adjust in real-time based on your 
                    performance and emotional state to optimize your learning experience.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HeartHandshake className="h-5 w-5 text-red-500" />
                    Personalized Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Receive tailored guidance and resources based on your learning patterns
                    and areas where you might need additional help.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-500" />
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Monitor your learning journey with detailed statistics and insights
                    on your achievements and areas for improvement.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">FAQ</h2>
            <div className="space-y-4">
              <Collapsible className="border rounded-lg">
                <CollapsibleTrigger className="flex w-full justify-between items-center p-4 font-medium hover:bg-muted/50">
                  <span>How does emotion tracking work?</span>
                  <ChevronDown className="h-5 w-5 transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                  <p>
                    Our emotion tracking technology uses computer vision to analyze facial expressions 
                    through your device's camera. The system recognizes patterns associated with different 
                    emotional states like happiness, confusion, boredom, or engagement. This data helps 
                    our platform adjust the learning experience to better suit your current state.
                  </p>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible className="border rounded-lg">
                <CollapsibleTrigger className="flex w-full justify-between items-center p-4 font-medium hover:bg-muted/50">
                  <span>Is my data private and secure?</span>
                  <ChevronDown className="h-5 w-5 transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                  <p>
                    Yes, we take privacy very seriously. All emotion data is processed locally on your 
                    device and only aggregated anonymized insights are sent to our servers. We never 
                    store raw video feeds, and all data is encrypted in transit and at rest. You can 
                    review our privacy policy for full details on how we handle your information.
                  </p>
                </CollapsibleContent>
              </Collapsible>
              
              <Collapsible className="border rounded-lg">
                <CollapsibleTrigger className="flex w-full justify-between items-center p-4 font-medium hover:bg-muted/50">
                  <span>Can I use the platform without emotion tracking?</span>
                  <ChevronDown className="h-5 w-5 transition-transform ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0 text-muted-foreground">
                  <p>
                    Absolutely! Emotion tracking is entirely optional. You can disable it at any time 
                    while still benefiting from our high-quality learning content. However, enabling 
                    emotion tracking allows for a more personalized experience that adapts to your 
                    engagement levels.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </section>
          
          <section className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg mb-6">
              Join thousands of learners who are experiencing the future of education today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/register">Create an Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/">Explore Modules</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
