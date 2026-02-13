// AI Resume Parser & CV Enhancer Edge Function
// Uses Lovable AI Gateway for NLP-based resume analysis
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, text, resume_text } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    // Route to different AI actions
    switch (action) {
      case "parse_resume":
        systemPrompt = `You are a resume parser. Extract structured information from the resume text provided. Return a JSON object with these fields:
- skills: array of skill strings found in the resume
- education: string summarizing education background
- experience: string summarizing work experience
- name: string of the candidate's name if found
Return ONLY valid JSON, no markdown.`;
        userPrompt = `Parse this resume:\n\n${resume_text}`;
        break;

      case "match_jobs":
        systemPrompt = `You are a job matching AI. Given a list of skills, suggest which job categories and types of roles would be best suited. Return a JSON object with:
- recommended_categories: array of strings (from: "Work From Home", "Full Time", "Part Time", "Engineering", "Data Science", "Design", "Marketing", "Sales")
- suggested_titles: array of 5 job title strings that match the skills
- match_score: number 1-100 indicating overall employability
Return ONLY valid JSON, no markdown.`;
        userPrompt = `Skills: ${text}`;
        break;

      case "spell_check":
        systemPrompt = `You are a spelling and grammar checker for resumes. Find all spelling errors and return a JSON object with:
- corrections: array of objects with { original, corrected, context }
- corrected_text: the full text with all corrections applied
Return ONLY valid JSON, no markdown.`;
        userPrompt = `Check this resume text:\n\n${resume_text || text}`;
        break;

      case "grammar_check":
        systemPrompt = `You are a grammar expert for professional documents. Analyze the text and return a JSON object with:
- issues: array of objects with { sentence, issue, suggestion }
- improved_text: the full text with grammar improvements
Return ONLY valid JSON, no markdown.`;
        userPrompt = `Check grammar:\n\n${resume_text || text}`;
        break;

      case "suggest_objective":
        systemPrompt = `You are a career advisor. Based on the skills and experience provided, suggest 3 professional profile objectives. Return a JSON object with:
- objectives: array of 3 strings, each a concise profile objective (2-3 sentences)
Return ONLY valid JSON, no markdown.`;
        userPrompt = `Skills and experience:\n\n${resume_text || text}`;
        break;

      case "suggest_skills":
        systemPrompt = `You are a career skills advisor. Based on the current skills listed, suggest additional relevant skills to add. Return a JSON object with:
- current_skills: array of skills found in the text
- suggested_skills: array of 10 additional skills to learn/add
- trending_skills: array of 5 currently trending skills in the industry
Return ONLY valid JSON, no markdown.`;
        userPrompt = `Current resume/skills:\n\n${resume_text || text}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    // Try to parse as JSON, fallback to raw content
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { raw: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
