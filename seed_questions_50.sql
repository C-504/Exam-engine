begin;

with seed_questions(category, prompt, options, correct_index, is_active) as (
    values
        -- Mathematics (1-5)
        ('mathematics', 'What is the derivative of x^2?', jsonb_build_array('2x', 'x', 'x^2', '2'), 0, true),
        ('mathematics', 'What is 7 × 8?', jsonb_build_array('54', '56', '49', '64'), 1, true),
        ('mathematics', 'What is the value of π rounded to two decimals?', jsonb_build_array('3.12', '3.14', '3.16', '3.18'), 1, true),
        ('mathematics', 'Solve: 12 + 28 ÷ 4', jsonb_build_array('10', '19', '22', '35'), 2, true),
        ('mathematics', 'What is the square root of 144?', jsonb_build_array('12', '11', '14', '10'), 0, true),
        -- Science (6-10)
        ('science', 'Which planet is known as the Red Planet?', jsonb_build_array('Venus', 'Mars', 'Jupiter', 'Mercury'), 1, true),
        ('science', 'What is H2O commonly known as?', jsonb_build_array('Oxygen', 'Hydrogen', 'Water', 'Salt'), 2, true),
        ('science', 'Which gas do humans exhale?', jsonb_build_array('Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Hydrogen'), 2, true),
        ('science', 'What part of the cell contains genetic material?', jsonb_build_array('Nucleus', 'Cytoplasm', 'Cell wall', 'Mitochondria'), 0, true),
        ('science', 'What force keeps planets in orbit around the sun?', jsonb_build_array('Magnetism', 'Friction', 'Gravity', 'Radiation'), 2, true),
        -- History (11-15)
        ('history', 'Who was the first President of the United States?', jsonb_build_array('John Adams', 'George Washington', 'Thomas Jefferson', 'James Madison'), 1, true),
        ('history', 'In which year did the Berlin Wall fall?', jsonb_build_array('1987', '1989', '1991', '1993'), 1, true),
        ('history', 'Which civilization built the pyramids at Giza?', jsonb_build_array('Romans', 'Mayans', 'Egyptians', 'Aztecs'), 2, true),
        ('history', 'Who wrote the Magna Carta?', jsonb_build_array('King John of England', 'William the Conqueror', 'Henry VIII', 'Elizabeth I'), 0, true),
        ('history', 'What war was ended by the Treaty of Versailles?', jsonb_build_array('World War I', 'World War II', 'American Civil War', 'Cold War'), 0, true),
        -- Geography (16-20)
        ('geography', 'What is the capital of Japan?', jsonb_build_array('Seoul', 'Tokyo', 'Beijing', 'Kyoto'), 1, true),
        ('geography', 'Which river runs through Egypt?', jsonb_build_array('Amazon', 'Yangtze', 'Nile', 'Danube'), 2, true),
        ('geography', 'Mount Everest is located in which mountain range?', jsonb_build_array('Andes', 'Rockies', 'Himalayas', 'Alps'), 2, true),
        ('geography', 'Which country has the largest population?', jsonb_build_array('USA', 'China', 'India', 'Russia'), 1, true),
        ('geography', 'What is the largest ocean on Earth?', jsonb_build_array('Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'), 3, true),
        -- Literature (21-25)
        ('literature', 'Who wrote "Pride and Prejudice"?', jsonb_build_array('Jane Austen', 'Charlotte Brontë', 'Emily Dickinson', 'Mary Shelley'), 0, true),
        ('literature', 'Which novel starts with "Call me Ishmael"?', jsonb_build_array('Moby-Dick', 'The Great Gatsby', '1984', 'The Odyssey'), 0, true),
        ('literature', 'George Orwell wrote which dystopian novel?', jsonb_build_array('Brave New World', 'Fahrenheit 451', '1984', 'Animal Farm'), 2, true),
        ('literature', 'Who created Sherlock Holmes?', jsonb_build_array('Agatha Christie', 'Arthur Conan Doyle', 'Ian Fleming', 'Charles Dickens'), 1, true),
        ('literature', 'Which play features the character Ophelia?', jsonb_build_array('Macbeth', 'Hamlet', 'Othello', 'King Lear'), 1, true),
        -- Technology (26-30)
        ('technology', 'What does CPU stand for?', jsonb_build_array('Central Processing Unit', 'Computer Personal Unit', 'Central Programming Utility', 'Control Processing Unit'), 0, true),
        ('technology', 'Which company developed the iPhone?', jsonb_build_array('Samsung', 'Microsoft', 'Apple', 'Google'), 2, true),
        ('technology', 'HTTP stands for?', jsonb_build_array('HyperText Transfer Protocol', 'High Transfer Text Process', 'HyperType Text Protocol', 'Hyper Transfer Tablet Process'), 0, true),
        ('technology', 'Which language is primarily used for iOS development?', jsonb_build_array('Swift', 'Java', 'C#', 'Ruby'), 0, true),
        ('technology', 'What does GPU stand for?', jsonb_build_array('General Processing Unit', 'Graphics Processing Unit', 'Graphics Programming Utility', 'Global Processing Unit'), 1, true),
        -- Programming (31-35)
        ('programming', 'Which language is known for running in the browser?', jsonb_build_array('Python', 'JavaScript', 'Go', 'Rust'), 1, true),
        ('programming', 'Which of these is a strongly typed superset of JavaScript?', jsonb_build_array('TypeScript', 'CoffeeScript', 'Elm', 'Clojure'), 0, true),
        ('programming', 'What does SQL stand for?', jsonb_build_array('Structured Query Language', 'Simple Query Language', 'Standard Query List', 'Sequential Question Logic'), 0, true),
        ('programming', 'Which of the following is a NoSQL database?', jsonb_build_array('PostgreSQL', 'MongoDB', 'MariaDB', 'SQLite'), 1, true),
        ('programming', 'Which Git command creates a new branch?', jsonb_build_array('git merge', 'git branch <name>', 'git commit', 'git status'), 1, true),
        -- Physics (36-40)
        ('physics', 'What is the speed of light in vacuum?', jsonb_build_array('3 × 10^5 km/s', '3 × 10^8 m/s', '3 × 10^6 m/s', '3 × 10^4 km/s'), 1, true),
        ('physics', 'Which law states F = ma?', jsonb_build_array('Newton''s First Law', 'Newton''s Second Law', 'Newton''s Third Law', 'Hooke''s Law'), 1, true),
        ('physics', 'What is the unit of electrical resistance?', jsonb_build_array('Ampere', 'Volt', 'Ohm', 'Tesla'), 2, true),
        ('physics', 'What particle carries a negative charge?', jsonb_build_array('Proton', 'Electron', 'Neutron', 'Photon'), 1, true),
        ('physics', 'What phenomenon explains why a straw looks bent in water?', jsonb_build_array('Diffraction', 'Reflection', 'Refraction', 'Dispersion'), 2, true),
        -- Chemistry (41-45)
        ('chemistry', 'What is the chemical symbol for gold?', jsonb_build_array('Ag', 'Au', 'Gd', 'Go'), 1, true),
        ('chemistry', 'Which pH value is neutral?', jsonb_build_array('5', '7', '9', '11'), 1, true),
        ('chemistry', 'Table salt is primarily composed of?', jsonb_build_array('NaCl', 'KCl', 'CaCO3', 'MgSO4'), 0, true),
        ('chemistry', 'What type of bond shares electrons?', jsonb_build_array('Ionic bond', 'Covalent bond', 'Hydrogen bond', 'Metallic bond'), 1, true),
        ('chemistry', 'Which gas is produced during photosynthesis?', jsonb_build_array('Carbon dioxide', 'Nitrogen', 'Oxygen', 'Methane'), 2, true),
        -- Biology (46-50)
        ('biology', 'What is the powerhouse of the cell?', jsonb_build_array('Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'), 2, true),
        ('biology', 'Which blood cells fight infection?', jsonb_build_array('Red blood cells', 'White blood cells', 'Platelets', 'Plasma'), 1, true),
        ('biology', 'DNA stands for?', jsonb_build_array('Deoxyribonucleic Acid', 'Deoxyribose Nucleic Acid', 'Double Nucleic Acid', 'Deoxyribonucleotide Acid'), 0, true),
        ('biology', 'What organ is responsible for pumping blood?', jsonb_build_array('Brain', 'Liver', 'Heart', 'Lungs'), 2, true),
        ('biology', 'Which kingdom do mushrooms belong to?', jsonb_build_array('Plantae', 'Fungi', 'Animalia', 'Protista'), 1, true)
)
insert into public.questions (category, prompt, options, correct_index, is_active)
select s.category, s.prompt, s.options, s.correct_index, s.is_active
from seed_questions s;

commit;
