'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Braces, Check, Copy, Gauge, Webhook } from 'lucide-react';

const codeExamples = {
  curl: `curl -X POST https://api.abdaty-tech.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+223XXXXXXXX",
    "message": "Bonjour du Mali!",
    "from": "AbdatyTech"
  }'`,
  
  javascript: `import axios from 'axios';

const sendSMS = async () => {
  const response = await axios.post(
    'https://api.abdaty-tech.com/v1/sms/send',
    {
      to: '+223XXXXXXXX',
      message: 'Bonjour du Mali!',
      from: 'AbdatyTech'
    },
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};`,

  python: `import requests

def send_sms():
    url = "https://api.abdaty-tech.com/v1/sms/send"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    payload = {
        "to": "+223XXXXXXXX",
        "message": "Bonjour du Mali!",
        "from": "AbdatyTech"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()`,

  php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.abdaty-tech.com/v1/sms/send",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer YOUR_API_KEY",
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => json_encode([
    "to" => "+223XXXXXXXX",
    "message" => "Bonjour du Mali!",
    "from" => "AbdatyTech"
  ])
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>`,

  java: `import java.net.http.*;
import java.net.URI;

public class SMSClient {
    public static void sendSMS() throws Exception {
        String apiKey = "YOUR_API_KEY";
        String url = "https://api.abdaty-tech.com/v1/sms/send";
        
        String json = """
            {
                "to": "+223XXXXXXXX",
                "message": "Bonjour du Mali!",
                "from": "AbdatyTech"
            }
            """;
        
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        
        HttpResponse<String> response = client.send(
            request, 
            HttpResponse.BodyHandlers.ofString()
        );
        
        System.out.println(response.body());
    }
}`,

  dart: `import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> sendSMS() async {
  final url = Uri.parse('https://api.abdaty-tech.com/v1/sms/send');
  final apiKey = 'YOUR_API_KEY';
  
  final response = await http.post(
    url,
    headers: {
      'Authorization': 'Bearer \$apiKey',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'to': '+223XXXXXXXX',
      'message': 'Bonjour du Mali!',
      'from': 'AbdatyTech',
    }),
  );
  
  if (response.statusCode == 200) {
    print('SMS envoyé: \${response.body}');
  } else {
    print('Erreur: \${response.statusCode}');
  }
}`,
};

type Language = keyof typeof codeExamples;

const apiFeatures = [
  { icon: Braces, title: 'API RESTful', description: 'Requêtes HTTP simples avec réponses JSON' },
  { icon: Webhook, title: 'Webhooks', description: 'Notifications de statut de livraison en temps réel' },
  { icon: Gauge, title: 'Limitation de débit', description: '1000 requêtes par minute incluses' },
];

export function CodeExamples() {
  const t = useTranslations('smsApi.code');
  const [selectedLang, setSelectedLang] = useState<Language>('curl');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeExamples[selectedLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const languages: { key: Language; label: string }[] = [
    { key: 'curl', label: 'cURL' },
    { key: 'javascript', label: 'JavaScript' },
    { key: 'python', label: 'Python' },
    { key: 'php', label: 'PHP' },
    { key: 'java', label: 'Java' },
    { key: 'dart', label: 'Dart/Flutter' },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          {/* Requête : onglets de langage + copie */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10 lg:col-span-7">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
              <div role="tablist" aria-label={t('request')} className="hide-scrollbar flex gap-1 overflow-x-auto">
                {languages.map((lang) => {
                  const active = selectedLang === lang.key;
                  return (
                    <button
                      key={lang.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setSelectedLang(lang.key)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span aria-live="polite">{copied ? t('copied') : t('copy')}</span>
              </button>
            </div>
            <pre className="h-96 overflow-auto p-6 font-mono text-[13px] leading-relaxed text-gray-200">
              <code>{codeExamples[selectedLang]}</code>
            </pre>
          </div>

          {/* Réponse */}
          <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10 lg:col-span-5">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5 text-sm font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {t('response')}
            </div>
            <pre className="flex-1 overflow-auto p-6 font-mono text-[13px] leading-relaxed text-gray-200">
              <code>{`{
  "success": true,
  "message_id": "msg_abc123xyz",
  "status": "sent",
  "to": "+223XXXXXXXX",
  "credits_used": 1,
  "timestamp": "2024-05-07T12:00:00Z"
}`}</code>
            </pre>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {apiFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-ink dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
