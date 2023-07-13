import os
import io
from pytesseract import pytesseract
from PyPDF2 import PdfReader
from PIL import Image
import fitz
from sys import stderr

def parse(line):
    year = line.split()[-1][:-1][2:] # parenthesis and 20XX
    instructor = ' '.join(line.split('-')[-1].split()[:-2])
    return year, instructor

dataset = {}
scores = {}

TOTAL = 0
SDISAGREE = 1
DISAGREE = 2
NEUTRAL = 3
AGREE = 4
SAGREE = 5

targets = ['gre', 'eut', 'ota' ]
def relevant(w):
    for t in targets:
        if t in w:
            return True
    return False

def match(c, s):
    if 'ota' in c:
        return TOTAL
    if 'utr' in c:
        return NEUTRAL
    if 'isa' in c:
        # print(c, 'is disagree')
        if s:
            return SDISAGREE
        else:
            return DISAGREE
    if 'gre' in c:
        # print(c, 'is agree')        
        if s:
            return SAGREE
        else:
            return AGREE

for filename in os.listdir('.'):
    if '.pdf' in filename:
        f = os.path.join('.', filename)
        if os.path.isfile(f):
            reader = PdfReader(f)
            images = fitz.open(f)
            q = 1
            scores[filename] = {}
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
                        if 'tron' in text: # just some match (less is more for OCR)
                            values = {} # start looking for the counts
                            text = text.replace('\n', ' ')
                            check = False
                            category = None
                            strongly = False
                            for w in text.split():
                                w = w.strip().lstrip()
                                if len(w) == 0:
                                    continue
                                if 'ongl' in w:
                                    strongly = True
                                if relevant(w):
                                    check = True
                                    category = w
                                    continue
                                if check:
                                    if ')' in w: # count should be there
                                        p = w.split(')')[0].replace('(', '')
                                        try:
                                            v = int(p)
                                            # print('got', v, 'using', p, 'from', w)
                                        except:
                                            print(w, 'is not an integer', file = stderr)
                                            v = None
                                        if v is not None:
                                            values[match(category, strongly)] = v
                                            strongly = False                                            
                                            category = None
                                            check = False                                    
                            scores[filename][q] = values
                            # print(q, values)
                            q += 1
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
            listing = []
            for line in content.split('\n'):
                line = line.strip().lstrip()
                if len(line) == 0:
                    continue
                if 'Mean' in line or 'Statistics' in line:
                    question = False
                    formulation = formulation.lstrip()
                    if len(formulation) > 0:
                        if formulation not in listing:
                            listing.append(formulation)
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
            dataset[filename] = (term, year, lettercode, numbercode, section, instructor, listing)

def complete(filename):
    for question, data in scores[filename].items():
        total = data.get(0, None)
        accum = 0
        missing = 0
        index = None
        for lvl in range(1, 6):
            v = data.get(lvl, None)
            if v is not None:
                accum += v
            else:
                missing += 1
                key = lvl
        if missing == 1: # recover one blank
            if total is not None:
                data[key] = total - accum
            
def output(labels, values, target):
    when = labels[0] + labels[1]
    what = labels[2] + labels[3]
    who = labels[5]
    questions = labels[6]
    qid = 1
    for q in questions:
        data = values.get(qid, None)
        qid += 1
        if data is not None:
            s = [ data.get(v, 0) for v in range(1, 6) ]
            s = [ v if v is not None else 0 for v in s ]
            status = 'ok' if sum(s) == data.get(0, None) else 'incomplete' 
            f = [ when, what, who, q, ' '.join([ str(i) for i in s]), status ]
            print(';'.join(f), file = target) # semicolon separated file
    
for filename in dataset:
    assert filename in scores
    complete(filename)
    with open('dataset.txt', 'w') as target:
        output(dataset[filename], scores[filename], target)
