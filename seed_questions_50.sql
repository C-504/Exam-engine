begin;

with seed_questions(category, prompt, options, correct_index, is_active) as (
    values
        -- Mathematics (10)
        ('mathematics', 'What is the derivative of x^2?', jsonb_build_array('2x', 'x', 'x^2', '2'), 0, true),
        ('mathematics', 'What is 7 × 8?', jsonb_build_array('54', '56', '49', '64'), 1, true),
        ('mathematics', 'What is the value of π rounded to two decimals?', jsonb_build_array('3.12', '3.14', '3.16', '3.18'), 1, true),
        ('mathematics', 'Solve: 12 + 28 ÷ 4', jsonb_build_array('10', '19', '22', '35'), 2, true),
        ('mathematics', 'What is the square root of 144?', jsonb_build_array('12', '11', '14', '10'), 0, true),
        ('mathematics', 'What is 15% of 200?', jsonb_build_array('20', '25', '30', '35'), 2, true),
        ('mathematics', 'Which number is a prime?', jsonb_build_array('21', '27', '31', '45'), 2, true),
        ('mathematics', 'How many degrees are in a triangle?', jsonb_build_array('90', '180', '270', '360'), 1, true),
        ('mathematics', 'What is 9 squared?', jsonb_build_array('18', '27', '72', '81'), 3, true),
        ('mathematics', 'If x + 5 = 12, what is x?', jsonb_build_array('5', '6', '7', '8'), 2, true),
        -- History (10)
        ('history', 'Who was the first President of the United States?', jsonb_build_array('John Adams', 'George Washington', 'Thomas Jefferson', 'James Madison'), 1, true),
        ('history', 'In which year did the Berlin Wall fall?', jsonb_build_array('1987', '1989', '1991', '1993'), 1, true),
        ('history', 'Which civilization built the pyramids at Giza?', jsonb_build_array('Romans', 'Mayans', 'Egyptians', 'Aztecs'), 2, true),
        ('history', 'Who signed the Emancipation Proclamation?', jsonb_build_array('Ulysses S. Grant', 'Abraham Lincoln', 'Andrew Jackson', 'James Buchanan'), 1, true),
        ('history', 'What war ended with the Treaty of Versailles?', jsonb_build_array('World War I', 'World War II', 'American Civil War', 'Cold War'), 0, true),
        ('history', 'Who was known as the Maid of Orléans?', jsonb_build_array('Joan of Arc', 'Mary, Queen of Scots', 'Catherine the Great', 'Marie Curie'), 0, true),
        ('history', 'Which empire was ruled by Julius Caesar?', jsonb_build_array('Greek Empire', 'Roman Empire', 'Persian Empire', 'Ottoman Empire'), 1, true),
        ('history', 'The Renaissance began in which country?', jsonb_build_array('France', 'Germany', 'Italy', 'Spain'), 2, true),
        ('history', 'Who wrote the Magna Carta?', jsonb_build_array('King John of England', 'William the Conqueror', 'Henry VIII', 'Elizabeth I'), 0, true),
        ('history', 'Which explorer first circumnavigated the globe?', jsonb_build_array('Christopher Columbus', 'Ferdinand Magellan', 'Marco Polo', 'Vasco da Gama'), 1, true),
        -- Science (10)
        ('science', 'Which planet is known as the Red Planet?', jsonb_build_array('Venus', 'Mars', 'Jupiter', 'Mercury'), 1, true),
        ('science', 'What is H2O commonly known as?', jsonb_build_array('Oxygen', 'Hydrogen', 'Water', 'Salt'), 2, true),
        ('science', 'Which gas do humans exhale?', jsonb_build_array('Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Hydrogen'), 2, true),
        ('science', 'What part of the cell contains genetic material?', jsonb_build_array('Nucleus', 'Cytoplasm', 'Cell wall', 'Mitochondria'), 0, true),
        ('science', 'What force keeps planets in orbit around the sun?', jsonb_build_array('Magnetism', 'Friction', 'Gravity', 'Radiation'), 2, true),
        ('science', 'What is the process plants use to make food?', jsonb_build_array('Osmosis', 'Photosynthesis', 'Respiration', 'Transpiration'), 1, true),
        ('science', 'Which organ pumps blood through the body?', jsonb_build_array('Lungs', 'Stomach', 'Heart', 'Pancreas'), 2, true),
        ('science', 'What is the basic unit of life?', jsonb_build_array('Atom', 'Molecule', 'Cell', 'Tissue'), 2, true),
        ('science', 'What is the boiling point of water at sea level?', jsonb_build_array('90°C', '95°C', '100°C', '110°C'), 2, true),
        ('science', 'What is the chemical symbol for oxygen?', jsonb_build_array('O', 'Ox', 'Og', 'On'), 0, true),
        -- Literature (10)
        ('literature', 'Who wrote "Pride and Prejudice"?', jsonb_build_array('Jane Austen', 'Charlotte Brontë', 'Emily Dickinson', 'Mary Shelley'), 0, true),
        ('literature', 'Which novel starts with "Call me Ishmael"?', jsonb_build_array('Moby-Dick', 'The Great Gatsby', '1984', 'The Odyssey'), 0, true),
        ('literature', 'George Orwell wrote which dystopian novel?', jsonb_build_array('Brave New World', 'Fahrenheit 451', '1984', 'Animal Farm'), 2, true),
        ('literature', 'Who created Sherlock Holmes?', jsonb_build_array('Agatha Christie', 'Arthur Conan Doyle', 'Ian Fleming', 'Charles Dickens'), 1, true),
        ('literature', 'Which play features the character Ophelia?', jsonb_build_array('Macbeth', 'Hamlet', 'Othello', 'King Lear'), 1, true),
        ('literature', 'Who wrote "To Kill a Mockingbird"?', jsonb_build_array('Harper Lee', 'Toni Morrison', 'Mark Twain', 'F. Scott Fitzgerald'), 0, true),
        ('literature', 'Which poem begins with "Two roads diverged in a yellow wood"?', jsonb_build_array('The Raven', 'The Road Not Taken', 'Daffodils', 'Ode to a Nightingale'), 1, true),
        ('literature', 'Who is the author of "The Catcher in the Rye"?', jsonb_build_array('J. D. Salinger', 'Ernest Hemingway', 'Jack Kerouac', 'John Steinbeck'), 0, true),
        ('literature', 'Which Shakespeare play includes the character Prospero?', jsonb_build_array('The Tempest', 'Julius Caesar', 'A Midsummer Night''s Dream', 'Twelfth Night'), 0, true),
        ('literature', 'Who wrote "Great Expectations"?', jsonb_build_array('Charles Dickens', 'Victor Hugo', 'Leo Tolstoy', 'George Eliot'), 0, true),
        -- Geography (10)
        ('geography', 'What is the capital of Japan?', jsonb_build_array('Seoul', 'Tokyo', 'Beijing', 'Kyoto'), 1, true),
        ('geography', 'Which river runs through Egypt?', jsonb_build_array('Amazon', 'Yangtze', 'Nile', 'Danube'), 2, true),
        ('geography', 'Mount Everest is located in which mountain range?', jsonb_build_array('Andes', 'Rockies', 'Himalayas', 'Alps'), 2, true),
        ('geography', 'Which country has the largest population?', jsonb_build_array('USA', 'China', 'India', 'Russia'), 1, true),
        ('geography', 'What is the largest ocean on Earth?', jsonb_build_array('Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'), 3, true),
        ('geography', 'Which continent is the Sahara Desert on?', jsonb_build_array('Africa', 'Asia', 'Australia', 'South America'), 0, true),
        ('geography', 'What is the capital city of Canada?', jsonb_build_array('Toronto', 'Ottawa', 'Vancouver', 'Montreal'), 1, true),
        ('geography', 'Which European city is known as the City of Canals?', jsonb_build_array('Amsterdam', 'Venice', 'Paris', 'Prague'), 1, true),
        ('geography', 'Which country is both in Europe and Asia?', jsonb_build_array('Germany', 'Brazil', 'Turkey', 'South Africa'), 2, true),
        ('geography', 'Which US state is known as the Sunshine State?', jsonb_build_array('California', 'Florida', 'Texas', 'Hawaii'), 1, true)
)
insert into public.questions (category, prompt, options, correct_index, is_active)
select s.category, s.prompt, s.options, s.correct_index, s.is_active
from seed_questions s;

commit;
