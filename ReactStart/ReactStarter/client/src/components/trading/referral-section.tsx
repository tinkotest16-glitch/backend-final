import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { User, Referral } from "@shared/schema";
import { formatCurrency } from "@/lib/trading";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy, ExternalLink, Gift, TrendingUp } from "lucide-react";

interface ReferralSectionProps {
  user: User;
}

export function ReferralSection({ user }: ReferralSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch user referrals
  const { data: referrals, isLoading } = useQuery<Referral[]>({
    queryKey: ["/api/referrals/user", user?.id],
    enabled: !!user?.id,
  });

  if (!user) {
    return null;
  }

  const referralLink = `${window.location.origin}?ref=${user.referralCode}`;
  const totalReferrals = referrals?.length || 0;
  const totalEarnings = parseFloat(user.referralEarnings || '0');

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy referral link",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `Join me on ProTrader - Advanced Trading Platform! Use my referral link to get started:`;
    const url = referralLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Card className="trading-card" id="referral">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Referral Program
        </CardTitle>
        <CardDescription className="text-gray-400">
          Earn 10% commission on every trade your referrals make
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-trading-primary rounded-lg p-4 border border-trading-border text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-trading-accent" />
            <p className="text-2xl font-bold text-white">{totalReferrals}</p>
            <p className="text-sm text-gray-400">Total Referrals</p>
          </div>
          
          <div className="bg-trading-primary rounded-lg p-4 border border-trading-border text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-trading-success" />
            <p className="text-2xl font-bold text-trading-success">
              {formatCurrency(totalEarnings)}
            </p>
            <p className="text-sm text-gray-400">Total Earned</p>
          </div>
          
          <div className="bg-trading-primary rounded-lg p-4 border border-trading-border text-center">
            <Gift className="h-8 w-8 mx-auto mb-2 text-trading-warning" />
            <p className="text-2xl font-bold text-white">10%</p>
            <p className="text-sm text-gray-400">Commission Rate</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Referral Link
            </label>
            <div className="flex space-x-2">
              <Input
                value={referralLink}
                readOnly
                className="trading-input flex-1 text-sm"
              />
              <Button
                className={`px-4 transition-colors ${
                  copied 
                    ? 'bg-trading-success hover:bg-green-600' 
                    : 'trading-button-primary'
                }`}
                onClick={copyReferralLink}
              >
                {copied ? (
                  <>
                    <Gift className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                onClick={() => shareOnSocial('twitter')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                onClick={() => shareOnSocial('facebook')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white"
                onClick={() => shareOnSocial('linkedin')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                onClick={() => shareOnSocial('whatsapp')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Program Benefits */}
        <div className="bg-trading-primary rounded-lg p-4 border border-trading-border">
          <h4 className="font-medium text-white mb-3">How It Works</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Share your unique referral link with friends and family</p>
            <p>• When they sign up and start trading, you earn 10% commission</p>
            <p>• Commission is paid on every trade they make</p>
            <p>• Earnings are added directly to your referral balance</p>
            <p>• No limit on the number of referrals you can make</p>
          </div>
        </div>

        {/* Recent Referrals */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="spinner w-5 h-5"></div>
          </div>
        ) : referrals && referrals.length > 0 ? (
          <div>
            <h4 className="font-medium text-white mb-3">Recent Referrals</h4>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((referral) => (
                <div 
                  key={referral.id}
                  className="flex items-center justify-between bg-trading-primary rounded-lg p-3 border border-trading-border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-trading-accent rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Referral #{referral.id.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-trading-success">
                      {formatCurrency(referral.totalEarnings)}
                    </p>
                    <Badge variant="outline" className="border-trading-success text-trading-success text-xs">
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p>No referrals yet</p>
            <p className="text-sm mt-1">Start sharing your link to earn commissions!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
