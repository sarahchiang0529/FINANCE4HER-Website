-- Add Income Categories
-- These categories are for income transactions
-- Only inserts if the category doesn't already exist

INSERT INTO categories (name)
SELECT 'Salary'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Salary');

INSERT INTO categories (name)
SELECT 'Government Benefit'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Government Benefit');

INSERT INTO categories (name)
SELECT 'Investments'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Investments');

-- Note: 'Other' might already exist, so we check first
INSERT INTO categories (name)
SELECT 'Other'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Other');

-- Add Expense Categories  
-- These categories are for expense transactions
-- Only inserts if the category doesn't already exist

INSERT INTO categories (name)
SELECT 'Food'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Food');

INSERT INTO categories (name)
SELECT 'Transport'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Transport');

INSERT INTO categories (name)
SELECT 'Entertainment'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Entertainment');

INSERT INTO categories (name)
SELECT 'Shopping'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Shopping');

INSERT INTO categories (name)
SELECT 'Utilities'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Utilities');

-- Note: Savings Goal categories (Education, Travel, Tech, Emergency, Home)
-- should already exist in your database from previous setup
