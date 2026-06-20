import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FeatureGateService } from "@/features/subscriptions/services";
import { DEFAULT_VALIDATION_MESSAGES } from "@/features/validation/constants/messages";
import { ValidationMessageService } from "@/features/validation/services/messages";
import { ValidationMessageType } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveValidationMessage, resetValidationMessage } from "@/features/validation/actions";
import { redirect } from "next/navigation";

export default async function ValidationMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const limits = await FeatureGateService.getAccessLimits(session.user.id);
  if (!limits) redirect("/pricing");

  const canEditGlobal = limits.features.customGlobalMessages;
  const canEditWebsite = limits.features.customWebsiteMessages;

  const messages = await ValidationMessageService.getMessages(session.user.id);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Validation Messages</h1>
        <p className="text-muted-foreground">
          Customize the validation errors returned by LeadCop across the SDK and Plugin.
        </p>
      </div>

      {!canEditGlobal && (
        <Card className="bg-muted border-dashed">
          <CardHeader>
            <CardTitle>Upgrade Required</CardTitle>
            <CardDescription>
              Your current plan only supports default validation messages. Upgrade to Growth to customize these messages globally.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {canEditGlobal && (
        <Card>
          <CardHeader>
            <CardTitle>Global Messages</CardTitle>
            <CardDescription>These messages apply to all websites under your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(DEFAULT_VALIDATION_MESSAGES).map(([type, defaultMsg]) => {
              const custom = messages.find((m: any) => m.messageType === type && m.websiteId === null);
              
              return (
                <div key={type} className="flex flex-col gap-2 p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{type}</span>
                    {custom ? (
                      <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-md">Custom</span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-800 rounded-md">Default</span>
                    )}
                  </div>
                  
                  <form action={async (formData) => {
                    "use server";
                    const newMsg = formData.get("message") as string;
                    await saveValidationMessage({
                      messageType: type as ValidationMessageType,
                      message: newMsg,
                      isEnabled: true
                    });
                  }} className="flex gap-2">
                    <Input 
                      name="message"
                      defaultValue={custom?.message || defaultMsg}
                      placeholder="Enter custom message..."
                    />
                    <Button type="submit" variant={custom ? "default" : "outline"}>
                      Save
                    </Button>
                    {custom && (
                      <Button 
                        type="button" 
                        variant="destructive"
                        formAction={async () => {
                          "use server";
                          await resetValidationMessage({ messageType: type as ValidationMessageType });
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </form>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
