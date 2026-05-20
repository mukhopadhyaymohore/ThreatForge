import os
import json
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from .classifier import classify_incident
from .prompts import PLAYBOOK_SYSTEM, build_user_prompt


class ClassifyIncidentView(APIView):
    def post(self, request):
        incident_text = request.data.get('incident_text', '').strip()
        if not incident_text:
            return Response({'error': 'incident_text is required'}, status=400)
        if len(incident_text) < 20:
            return Response({'error': 'Please describe the incident in more detail'}, status=400)
        try:
            result = classify_incident(incident_text)
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


# class GeneratePlaybookView(APIView):
#     def post(self, request):
#         incident_text = request.data.get('incident_text', '').strip()
#         if not incident_text:
#             return Response({'error': 'incident_text is required'}, status=400)
#         try:
#             classification = classify_incident(incident_text)
#             user_prompt = build_user_prompt(incident_text, classification)

#             response = requests.post(
#                 'https://api.groq.com/openai/v1/chat/completions',
#                 headers={
#                     'Authorization': f"Bearer {os.getenv('GROQ_API_KEY')}",
#                     'Content-Type': 'application/json',
#                 },
#                 json={
#                     'model': 'llama3-70b-8192',
#                     'messages': [
#                         {'role': 'system', 'content': PLAYBOOK_SYSTEM},
#                         {'role': 'user', 'content': user_prompt}
#                     ],
#                     'max_tokens': 4000,
#                     'temperature': 0.3,
#                 }
#             )
#             result = response.json()
#             raw = result['choices'][0]['message']['content']
#             clean = raw.replace('```json', '').replace('```', '').strip()
#             playbook = json.loads(clean)
#             return Response({'classification': classification, 'playbook': playbook})

#         except json.JSONDecodeError:
#             return Response({'error': 'Failed to parse playbook response'}, status=500)
#         except Exception as e:
#             return Response({'error': str(e)}, status=500)
        

class GeneratePlaybookView(APIView):
    def post(self, request):
        incident_text = request.data.get('incident_text', '').strip()
        if not incident_text:
            return Response({'error': 'incident_text is required'}, status=400)
        try:
            classification = classify_incident(incident_text)
            user_prompt = build_user_prompt(incident_text, classification)

            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f"Bearer {os.getenv('GROQ_API_KEY')}",
                    'Content-Type': 'application/json',
                },
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [
                        {'role': 'system', 'content': PLAYBOOK_SYSTEM},
                        {'role': 'user', 'content': user_prompt}
                    ],
                    'max_tokens': 4000,
                    'temperature': 0.3,
                }
            )
            result = response.json()

            # Show exact Groq error if something went wrong
            if 'choices' not in result:
                return Response({'error': str(result)}, status=500)

            raw = result['choices'][0]['message']['content']
            clean = raw.replace('```json', '').replace('```', '').strip()
            playbook = json.loads(clean)
            return Response({'classification': classification, 'playbook': playbook})

        except json.JSONDecodeError:
            return Response({'error': 'Failed to parse playbook response'}, status=500)
        except Exception as e:
            return Response({'error': str(e)}, status=500)