import os
import io
from pytesseract import pytesseract
from PyPDF2 import PdfReader
from PIL import Image
import fitz


dataset = []
questions = set()

def parse(line):
    year = line.split()[-1][:-1][2:] # parenthesis and 20XX
    instructor = ' '.join(line.split('-')[-1].split()[:-2])
    return year, instructor

scores = {}
for filename in os.listdir('.'):
    if '.pdf' in filename:
        f = os.path.join('.', filename)
        if os.path.isfile(f):
            reader = PdfReader(f)
            images = fitz.open(f)
            q = 0
            scores[filename] = []
            for i in range(len(images)):
                page = images[i]
                l = page.get_images(full = True)
                if l:
                    for ii, img in enumerate(l, start = 1):
                        xref = img[0]
                        base_image = images.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        image = Image.open(io.BytesIO(image_bytes))
                        text = pytesseract.image_to_string(image)
                        if 'Strongly Disagree' in text:
                            q += 1 # this is a question data image
                        for line in text.split('\n'):
                            if 'gree' in line or 'Neutral' in line: # score
                                pts = line.split()[0]
                                if '(' in line:
                                    count = line.split('(')[1].split(')')[0]
                                elif '%' in line:
                                    count = line.split()[-1]
                                    assert '%' in count
                                else:
                                    count = None # hopefully only one is illegible
                                scores[filename].append((q, pts, count))
                            elif 'Total' in line: 
                                scores[filename].append((q, 'T', line.split()[-1][1:-1]))
            content = ''
            for page in reader.pages:
                content += page.extract_text()
            question = False
            formulation = ''
            term = None
            year = None
            instructor = None
            lettercode = None
            numbercode = None
            section = None
            prev = None
            for line in content.split('\n'):
                line = line.strip().lstrip()
                if len(line) == 0:
                    continue
                if 'Mean' in line or 'Statistics' in line:
                    question = False
                    if len(formulation) > 0:
                        questions.add(formulation)
                    formulation = ''
                    continue
                if (line[0] == 'Q' and 'Questionnaire' not in line) \
                   or 'In general' in line \
                   or (line[:4] == 'The ' and 'ratings' not in line):
                    question = True
                if question:
                    if line not in formulation:
                        formulation += ' ' + line
                if 'Mercury Course Evaluation' in line:
                    continue
                if '(Fall' in line:
                    term = 'F'
                    year, instructor = parse(line)
                elif '(Winter' in line:
                    term = 'W'
                    year, instructor = parse(line)
                elif '(Summer' in line:
                    term = 'S'
                    year, instructor = parse(line)
                if 'Course Name ' in line:
                    fields = line.split()
                    lettercode = fields[2]
                    numbercode = fields[3][:-1] # colon
                    section = fields[-3][:-1] # comma
            dataset.append((term, year, lettercode, numbercode, section, instructor, formulation))

qn = 1            
for q in questions:
    print(qn, q)
    qn += 1

for filename in scores:
    data = scores[filename]
    for t in data:
        c = t.count(None)
        if c > 1:
            print(filename, t)

