import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, UtensilsCrossed, Info, Heart, Users, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  user_id: number
  english_name: string
  nationality: string
  languages: string
  shared_info: string
  favorite_foods: string
  dietary_restrictions: string
  hobbies: string
  image_url: string
  work_status: 'notStarted' | 'working' | 'onBreak'
}

const teamMembers: TeamMember[] = [
  {
    user_id: 1,
    english_name: "Emily Smith",
    nationality: "United States",
    languages: "English, Japanese",
    shared_info: "Christian. Often goes to church on holidays. Picks up children in the morning and evening.",
    favorite_foods: "Cheeseburger, Sushi",
    dietary_restrictions: "Tomatoes, Shellfish",
    hobbies: "Hiking, Watching movies",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'working'
  },
  {
    user_id: 2,
    english_name: "Ling Wang",
    nationality: "China",
    languages: "Chinese",
    shared_info: "Can only work after 5 PM due to classes",
    favorite_foods: "Dumplings, Ramen",
    dietary_restrictions: "Dairy",
    hobbies: "Cooking, Reading",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'onBreak'
  },
  {
    user_id: 3,
    english_name: "Jisoo Kim",
    nationality: "South Korea",
    languages: "Korean",
    shared_info: "",
    favorite_foods: "Kimchi stew, Yakiniku",
    dietary_restrictions: "Peanuts",
    hobbies: "Playing guitar, Traveling",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'working'
  },
  {
    user_id: 4,
    english_name: "Agus Pratama",
    nationality: "Indonesia",
    languages: "Indonesian",
    shared_info: "Muslim. Fasts during Ramadan and needs prayer time. Does not consume pork or alcohol.",
    favorite_foods: "Nasi Goreng, Yakitori",
    dietary_restrictions: "Pork, Alcohol",
    hobbies: "Playing soccer, Photography",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'notStarted'
  },
  {
    user_id: 5,
    english_name: "Thanh Le",
    nationality: "Vietnam",
    languages: "Vietnamese",
    shared_info: "Buddhist",
    favorite_foods: "Pho, Curry",
    dietary_restrictions: "Gluten",
    hobbies: "Gardening, Karaoke",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'working'
  },
  {
    user_id: 6,
    english_name: "Rohan Singh",
    nationality: "India",
    languages: "Hindi",
    shared_info: "Hindu. Does not eat beef. May cook traditional dishes at home on Indian holidays.",
    favorite_foods: "Curry, Naan",
    dietary_restrictions: "Beef, Eggs",
    hobbies: "Playing cricket, Reading",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'onBreak'
  },
  {
    user_id: 7,
    english_name: "Ali Yilmaz",
    nationality: "Turkey",
    languages: "Turkish, Japanese, English",
    shared_info: "Muslim. Values daily prayer times and does not consume pork or alcohol.",
    favorite_foods: "Kebab, Tempura",
    dietary_restrictions: "Pork, Alcohol, Soy",
    hobbies: "Traveling, Motorcycle touring",
    image_url: "/placeholder.svg?height=100&width=100",
    work_status: 'working'
  }
]

const getBadgeStyle = (workStatus: string) => {
  if (workStatus === "working") return "border border-green-300 bg-green-100 text-green-800 px-3 py-1 text-xs"
  if (workStatus === "onBreak") return "border border-yellow-300 bg-yellow-100 text-yellow-800 px-3 py-1 text-xs"
  if (workStatus === "notStarted") return "border border-blue-300 bg-blue-100 text-blue-800 px-3 py-1 text-xs"
}

const getBadgeLabel = (workStatus: string) =>{
  if (workStatus === "working") return "勤務中"
  if (workStatus === "onBreak") return "休憩中"
  if (workStatus === "notStarted") return "未出勤"
}


export default function Component() {
  return (
    <div className="container mx-auto px-4 md:px-6 bg-white">
      <div className="h-6"></div>
      <h1 className="text-3xl font-bold"><Users className="h-7 w-7 inline-block mr-1 mb-1 ml-1" />メンバー</h1>
      <div className="h-5"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((member) => (
          <Card key={member.user_id} className="overflow-hidden border shadow-lg relative pb-9">
            <CardHeader className="py-4 bg-blue-50 pr-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12 border-2 border-blue-300">
                    <AvatarImage src={member.image_url} alt={member.english_name} />
                    <AvatarFallback className="bg-blue-200 text-blue-800">{member.english_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl text-black">{member.english_name}</CardTitle>
                    <p className="text-sm text-blue-700">{member.nationality}</p>
                  </div>
                </div>
               {member.work_status !== "notStarted" && ( <div className="">
                  <Badge className={`${getBadgeStyle(member.work_status)} transition-all`}>{getBadgeLabel(member.work_status)}</Badge>
                </div>)}
              </div>
            </CardHeader>

            <CardContent className="bg-white pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-sm ">言語 : </span>
                  <span className="text-sm">{member.languages}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-sm">食事の好み</span>
                  </div>
                  <p className="text-sm pl-7">好きな食べ物： {member.favorite_foods}</p>
                  {member.dietary_restrictions && (
                    <p className="text-sm pl-7 text-gray-600">
                      食べられないもの： {member.dietary_restrictions}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-sm ">趣味 </span>
                  </div>
                  <p className="text-sm pl-7">{member.hobbies}</p>
                </div>
                {member.shared_info && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-sm ">Please know </span>
                    </div>
                    <p className="text-sm pl-7">{member.shared_info}</p>
                  </div>
                )}
              </div>
            </CardContent>

            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700 rounded-lg"
              // onClick={() => console.log(`Chat with ${member.english_name}`)}
            >
              <MessageCircle className="w-4 h-4 mb-0.5" />
              チャットへ
            </Button>
          </Card>
        ))}
      </div>
      <div className="h-6"></div>
    </div>
  )
}