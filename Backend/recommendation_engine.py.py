import pandas as pd
from sklearn.neighbors import NearestNeighbors
#Purpose: Machine Learning for personalized recommendations
#Use Case: Suggest items based on user behavior
def generate_recommendations(user_id):
    # Load rental history data
    df = pd.read_csv('rental_history.csv')
    # Prepare data (pivot table: users vs items)
    user_item_matrix = df.pivot_table(index='user_id', 
                                      columns='item_id', 
                                      values='rating', 
                                      fill_value=0)
    # Train KNN model
    model = NearestNeighbors(n_neighbors=5, metric='cosine')
    model.fit(user_item_matrix)
    
    # Generate recommendations
    distances, indices = model.kneighbors([user_item_matrix.loc[user_id]])
    similar_users = user_item_matrix.iloc[indices[0]]
    
    # Return top recommended items
    return similar_users.mean().sort_values(ascending=False).head(5).index.tolist()

# Example usage
if __name__ == "__main__":
    print("Recommended items:", generate_recommendations(123))