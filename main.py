import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from collections import defaultdict

# --- Page Configuration ---
st.set_page_config(
    page_title="Doppelkopf Score Tracker",
    page_icon="🃏",
    layout="wide",
    initial_sidebar_state="collapsed"
)


# --- Functions ---

def initialize_game_state():
    """Sets up the initial session state for the entire app."""
    if 'game_started' not in st.session_state:
        st.session_state.game_started = False
    if 'players' not in st.session_state:
        st.session_state.players = {"Player 1": "Alice", "Player 2": "Bob", "Player 3": "Charlie", "Player 4": "Dana"}
    if 'player_names' not in st.session_state:
        st.session_state.player_names = []
    if 'game_history' not in st.session_state:
        st.session_state.game_history = []
    if 'scores' not in st.session_state:
        st.session_state.scores = defaultdict(list)
    if 'is_solo' not in st.session_state:
        st.session_state.is_solo = False
    if 'solo_player_input' not in st.session_state:
        st.session_state.solo_player_input = None
    if 'normal_player_input' not in st.session_state:
        st.session_state.normal_player_input = []
    if 'dealer_index' not in st.session_state:
        st.session_state.dealer_index = 3


def reset_game():
    """Resets the state to start a new game session."""
    st.session_state.game_started = False
    st.session_state.game_history = []
    st.session_state.scores = defaultdict(list)
    st.session_state.is_solo = False
    st.session_state.solo_player_input = None
    st.session_state.normal_player_input = []
    st.session_state.dealer_index = 3


def process_game_submission():
    """Callback to validate, process, and clear the new game form."""
    is_solo_game = st.session_state.is_solo
    game_points = st.session_state.points_input

    if is_solo_game:
        re_players_input = [st.session_state.solo_player_input] if st.session_state.solo_player_input else []
    else:
        re_players_input = st.session_state.normal_player_input

    if (is_solo_game and len(re_players_input) != 1) or (not is_solo_game and len(re_players_input) != 2):
        st.error("Please select the correct number of players for the game type.")
        return

    game_num = len(st.session_state.game_history) + 1

    if is_solo_game:
        soloist_points = game_points * 3
        current_game_scores = {p: -game_points for p in st.session_state.player_names}
        current_game_scores[re_players_input[0]] = soloist_points
    else:
        kontra_players = [p for p in st.session_state.player_names if p not in re_players_input]
        current_game_scores = {p: game_points for p in re_players_input}
        current_game_scores.update({p: -game_points for p in kontra_players})

    st.session_state.game_history.append({
        "Game": game_num, "Re Party": ", ".join(re_players_input),
        "Type": "Solo" if is_solo_game else "Normal", "Points": game_points
    })

    for p_name in st.session_state.player_names:
        last_score = st.session_state.scores.get(p_name, [])[-1] if st.session_state.scores.get(p_name) else 0
        st.session_state.scores[p_name].append(last_score + current_game_scores.get(p_name, 0))

    if not is_solo_game:
        st.session_state.dealer_index = (st.session_state.dealer_index + 1) % 4

    st.toast(f"Game {game_num} added successfully!", icon="🎉")
    st.session_state.solo_player_input = None
    st.session_state.normal_player_input = []


@st.cache_data
def calculate_player_stats(game_history, player_names):
    if not game_history: return pd.DataFrame()
    player_stats = {name: {'solos_played': 0, 'solos_won': 0, 'games_won': 0} for name in player_names}
    for game in game_history:
        winners = [p.strip() for p in game['Re Party'].split(',')]
        is_solo_game = game['Type'] == 'Solo'
        for winner in winners:
            if winner in player_stats:
                player_stats[winner]['games_won'] += 1
                if is_solo_game: player_stats[winner]['solos_won'] += 1
        if is_solo_game and winners and winners[0] in player_stats:
            player_stats[winners[0]]['solos_played'] += 1
    stats_data = []
    total_games = len(game_history)
    for name, data in player_stats.items():
        win_rate = (data['games_won'] / total_games * 100) if total_games > 0 else 0
        solo_win_rate = (data['solos_won'] / data['solos_played'] * 100) if data['solos_played'] > 0 else 0
        stats_data.append({'Player': name, 'Games Won': data['games_won'], 'Win Rate (%)': f"{win_rate:.1f}",
                           'Solos Played': data['solos_played'], 'Solos Won': data['solos_won'],
                           'Solo Win Rate (%)': f"{solo_win_rate:.1f}"})
    return pd.DataFrame(stats_data).set_index('Player')


def generate_round_tables(game_history, scores, player_names):
    """Splits the game history into a list of DataFrames, one for each round."""
    if not game_history:
        return []

    tables = []
    round_games_data = []
    start_index = 0
    normal_game_count = 0

    for i, game in enumerate(game_history):
        game_data = {}
        for player in player_names:
            game_data[player] = scores[player][i]

        game_data['Points Awarded']=game['Points']
        game_data['Game Type']=game['Type']
        round_games_data.append(game_data)

        if game['Type'] == 'Normal':
            normal_game_count += 1

        if normal_game_count == 4:
            df = pd.DataFrame(round_games_data)
            df.index = [f"Game {start_index + j + 1}" for j in range(len(df))]
            tables.append(df)
            round_games_data, start_index, normal_game_count = [], i + 1, 0

    if round_games_data:
        df = pd.DataFrame(round_games_data)
        df.index = [f"Game {start_index + j + 1}" for j in range(len(df))]
        tables.append(df)

    return tables


# --- App Initialization ---
initialize_game_state()

# --- Main App Flow ---
if not st.session_state.game_started:
    st.title("🃏 Doppelkopf Score Tracker Setup")
    with st.form("player_setup_form"):
        st.markdown("Enter the names of the four players to begin.")
        cols = st.columns(4)
        player_keys = list(st.session_state.players.keys())
        for i, col in enumerate(cols):
            st.session_state.players[player_keys[i]] = col.text_input(f"Player {i + 1}",
                                                                      value=st.session_state.players.get(player_keys[i],
                                                                                                         ""),
                                                                      key=f'setup_p{i + 1}')
        if st.form_submit_button("Start Game"):
            player_names = [name for name in st.session_state.players.values() if name]
            if len(player_names) != 4 or len(set(player_names)) != 4:
                st.error("Please enter four unique player names.")
            else:
                st.session_state.player_names = player_names
                st.session_state.game_started = True
                st.rerun()
else:
    col_title, col_button = st.columns([3, 1])
    with col_title:
        st.title("Doppelkopf Score Tracker")
    with col_button:
        st.markdown("<div style='margin-top: 25px;'></div>", unsafe_allow_html=True)
        st.button("Reset Game & Players", on_click=reset_game, use_container_width=True)

    tab1, tab2, tab3 = st.tabs(["📊 Scoreboard & New Game", "📈 Analytics & History", "🧠 Cheatsheet"])
    with tab1:
        st.header("Current Standings")

        next_dealer_name = st.session_state.player_names[st.session_state.dealer_index]
        cols = st.columns(4)
        sorted_players = sorted(st.session_state.player_names,
                                key=lambda p: st.session_state.scores[p][-1] if st.session_state.scores[p] else 0,
                                reverse=True)

        for player in sorted_players:
            with cols.pop(0):
                label = f"🃏 {player}" if player == next_dealer_name else player
                st.metric(label=label,
                          value=st.session_state.scores[player][-1] if st.session_state.scores[player] else 0)

        st.header("Game-by-Game History")
        if st.session_state.game_history:
            round_tables = generate_round_tables(st.session_state.game_history, st.session_state.scores,
                                                 st.session_state.player_names)
            for i, round_df in enumerate(round_tables):
                st.subheader(f"Round {i + 1}")
                st.dataframe(round_df)
        else:
            st.info("No games have been added yet.")
            
        st.divider()
        
        st.header("Add New Game Result")
        st.toggle("Solo Game?", key="is_solo")
        with st.form("new_game_form"):
            if st.session_state.is_solo:
                st.selectbox("Select the solo player", options=st.session_state.player_names, key="solo_player_input",
                             index=None, placeholder="Select a player...")
            else:
                st.multiselect("Select 'Re' party (winners)", options=st.session_state.player_names, max_selections=2,
                               key="normal_player_input", placeholder="Select two players...")
            st.number_input("Points for this game", min_value=1, step=1, key="points_input")
            st.form_submit_button("Add Game", on_click=process_game_submission)
    with tab2:
        st.header("Score Progression")
        if st.session_state.game_history:
            fig = go.Figure()
            game_axis = list(range(1, len(st.session_state.game_history) + 1))
            colors = ['#007BFF', '#28a745', '#ffc107', '#dc3545']

            for i, player in enumerate(st.session_state.player_names):
                fig.add_trace(
                    go.Scatter(x=game_axis, y=st.session_state.scores[player], mode='lines+markers', name=player,
                               line=dict(width=3, color=colors[i])))

            for i, player in enumerate(st.session_state.player_names):
                fig.add_annotation(
                    x=game_axis[-1], y=st.session_state.scores[player][-1],
                    text=player, showarrow=False, xanchor='left', xshift=5,
                    font=dict(color=colors[i], size=14)
                )

            normal_game_count = 0
            for i, game in enumerate(st.session_state.game_history):
                if game['Type'] == 'Normal':
                    normal_game_count += 1
                    if normal_game_count > 0 and normal_game_count % 4 == 0 and (i + 1) < len(
                            st.session_state.game_history):
                        fig.add_vline(x=i + 1.5, line_width=1, line_dash="dash", line_color="lightgray")

            fig.update_layout(
                xaxis_title='Game Number', yaxis_title='Total Score',
                plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)',
                font_color='#333', showlegend=False,
                xaxis=dict(gridcolor='#e0e0e0', dtick=1),
                yaxis=dict(gridcolor='#e0e0e0')
            )
            config = {'staticPlot': True, 'displayModeBar': False}
            st.plotly_chart(fig, use_container_width=True, config=config)
        else:
            st.info("The chart will appear here once games are added.")
        st.divider()
        st.header("Player Statistics")
        stats_df = calculate_player_stats(st.session_state.game_history, st.session_state.player_names)
        if not stats_df.empty:
            st.dataframe(stats_df)
        else:
            st.info("Player statistics will be shown here.")
    with tab3:
        st.header("Doppelkopf Cheatsheet")
        st.subheader("Card Ranking (Highest to Lowest)")
        col1, col2 = st.columns(2)
        with col1:
            st.markdown(
                '''<div class="card"><div class="card-title">Trump Cards Hierarchy</div><div class="card-content"><ol><li>♥️ 10 (Dullen)</li><li>♣️ Q (Alte)</li><li>♠️ Q (Alte)</li><li>♥️ Q (Alte)</li><li>♦️ Q (Alte)</li><li>♣️ J</li><li>♠️ J</li><li>♥️ J</li><li>♦️ J</li><li>♦️ A</li><li>♦️ 10</li><li>♦️ K</li></ol><i>Special Rule: If both ♥️10s are played in the same trick, the second one played wins (unless it's the last trick).</i></div></div>''',
                unsafe_allow_html=True)
        with col2:
            st.markdown(
                '''<div class="card"><div class="card-title">Non-Trump Suit Ranking</div><div class="card-content">For any non-trump suit (♣️, ♠️, ♥️):<ol><li>Ace (A)</li><li>Ten (10)</li><li>King (K)</li></ol><br><i>If two identical cards are played, the first one wins.</i></div></div>''',
                unsafe_allow_html=True)
        st.subheader("Reservation Priority (Vorbehalt)")
        st.markdown('''<div class="card"><div class="card-title">Determining What is Played</div><div class="card-content">If one or more players announce a reservation, the priority is:<ol>
            <li><b>Misdeal / Throwing In (highest priority):</b> A player can declare a misdeal before the first card is played if they have:
                <ul>
                    <li>Less than 3 trump cards</li>
                    <li>5 or more Kings</li>
                    <li>7 or more Aces/Tens (Volle)</li>
                    <li>All personal trumps are lower than the Jack of Diamonds</li>
                </ul>
            </li>
            <li><b>Hochzeit (Wedding):</b> Outranks any Solo.</li>
            <li><b>Solo</b></li></ol></div></div>''', unsafe_allow_html=True)
