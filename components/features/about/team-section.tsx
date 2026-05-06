import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionWrapper } from "@/components/features/shared/section-wrapper";

const teamMembers = [
  {
    name: "Salman Nawaz",
    email: "salmannawaz008@gmail.com",
    role: "Founder & Lead Developer",
  },
  {
    name: "Tahir Saad",
    email: "tahirsaad73@gmail.com",
    role: "Co-Founder & Clinical Advisor",
  },
  {
    name: "Muskan Awais",
    email: "Muskanawais02@gmail.com",
    role: "UI/UX Designer & Researcher",
  },
];

export function TeamSection() {
  return (
    <SectionWrapper id="team">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Meet the dedicated professionals working to revolutionize mental health care through ethical AI and clinical excellence.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {teamMembers.map((member, index) => (
          <Card key={index} className="border-2 overflow-hidden group bg-card">
            <div className="aspect-square bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
            </div>
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <p className="text-sm text-primary font-medium">{member.role}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SectionWrapper>
  );
}
