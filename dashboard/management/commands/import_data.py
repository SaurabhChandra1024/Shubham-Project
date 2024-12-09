import json
from django.core.management.base import BaseCommand
from dashboard.models import EnergyData
from datetime import datetime

class Command(BaseCommand):
    help = 'Import data from a JSON file into the database'

    def handle(self, *args, **kwargs):
        file_path = '/home/falcon1024/shubhamproject/mydashboard/jsondata.json'
        
        try:
            with open(file_path, 'r') as file:
                data = json.load(file)
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
            return
        except json.JSONDecodeError as e:
            self.stderr.write(self.style.ERROR(f"Error decoding JSON file: {e}"))
            return

        if not isinstance(data, list):
            self.stderr.write(self.style.ERROR("JSON data is not a list"))
            return

        for entry in data:
            added_str = entry.get('added')
            published_str = entry.get('published')
            
            if not added_str or not published_str:
                self.stderr.write(self.style.ERROR(f"Missing 'added' or 'published' field in entry: {entry}"))
                continue

            try:
                added_date = datetime.strptime(added_str, "%B, %d %Y %H:%M:%S")
                published_date = datetime.strptime(published_str, "%B, %d %Y %H:%M:%S")
            except ValueError as e:
                self.stderr.write(self.style.ERROR(f"Error parsing date for entry: {entry}. Error: {e}"))
                continue

            try:
                EnergyData.objects.create(
                    end_year=entry.get('end_year'),
                    intensity=entry['intensity'],
                    sector=entry['sector'],
                    topic=entry['topic'],
                    insight=entry['insight'],
                    url=entry['url'],
                    region=entry['region'],
                    start_year=entry.get('start_year'),
                    impact=entry.get('impact'),
                    added=added_date,
                    published=published_date,
                    country=entry['country'],
                    relevance=entry['relevance'],
                    pestle=entry['pestle'],
                    source=entry['source'],
                    title=entry['title'],
                    likelihood=entry['likelihood'],
                )
                self.stdout.write(self.style.SUCCESS(f"Successfully imported entry: {entry['title']}"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Error importing entry: {entry}. Error: {e}"))

        self.stdout.write(self.style.SUCCESS('Successfully imported data'))