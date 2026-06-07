import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Formato de e-mail inválido");
    }

    // Validate field lengths
    if (name.length > 100) {
      throw new Error("Nome deve ter no máximo 100 caracteres");
    }
    if (email.length > 255) {
      throw new Error("E-mail deve ter no máximo 255 caracteres");
    }
    if (message.length > 2000) {
      throw new Error("Mensagem deve ter no máximo 2000 caracteres");
    }

    const emailResponse = await resend.emails.send({
      from: "Fundação Tia Zélia <onboarding@resend.dev>",
      to: ["contact.flig@gmail.com"],
      subject: `Nova mensagem de contato - ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Nova Mensagem de Contato
          </h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;">
              <strong>Nome:</strong> ${name}
            </p>
            <p style="margin: 0 0 10px 0;">
              <strong>E-mail:</strong> <a href="mailto:${email}">${email}</a>
            </p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Mensagem:</h3>
            <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">
            Esta mensagem foi enviada através do formulário de contato do site da Fundação Tia Zélia.
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    console.error("Error in send-contact-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
