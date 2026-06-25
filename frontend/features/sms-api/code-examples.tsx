'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

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

export function CodeExamples() {
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Quick Integration</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">Get started in minutes with our simple REST API</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* API Example */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden h-full">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>API Example</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.key}
                      onClick={() => setSelectedLang(lang.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedLang === lang.key
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="bg-gray-900 text-gray-100 p-6 overflow-x-auto text-sm leading-relaxed h-96">
                  <code>{codeExamples[selectedLang]}</code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>

          {/* Response Example */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden h-full">
              <CardHeader className="bg-green-50 border-b border-green-200">
                <CardTitle className="text-green-900">Response (200 OK)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <pre className="bg-gray-900 text-gray-100 p-6 overflow-x-auto text-sm leading-relaxed h-96 flex items-center">
                  <code>{`{
  "success": true,
  "message_id": "msg_abc123xyz",
  "status": "sent",
  "to": "+223XXXXXXXX",
  "credits_used": 1,
  "timestamp": "2024-05-07T12:00:00Z"
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* API Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: 'API RESTful',
              description: 'Requêtes HTTP simples avec réponses JSON',
            },
            {
              title: 'Webhooks',
              description: 'Notifications de statut de livraison en temps réel',
            },
            {
              title: 'Limitation de débit',
              description: '1000 requêtes par minute incluses',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
